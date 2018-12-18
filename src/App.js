import React, { Component } from 'react';
import axios from 'axios';
import Organization from './Organization';

const title = 'React GraphQL GitHub Client';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`
  }
});

const GET_ISSUES_OF_REPOSITORY = `
  query (
    $organization: String!,
    $repo: String!,
    $endCursor: String
  ) {
    organization(login: $organization) {
      name
      url
      repository(name: $repo) {
        id
        name
        url
        stargazers {
          totalCount
        }
        viewerHasStarred
        issues(first: 5, after: $endCursor, states: [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

const getIssuesFromRepo = (path, endCursor) => {

  const [organization, repo] = path.split('/');

  return axiosGitHubGraphQL.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repo, endCursor }
  });

}

const resolveIssuesFromQuery = (queryResult, endCursor) => oldState => {

  const { data, errors } = queryResult.data;

  if (errors) {
    return {
      ...oldState,
      errors
    };
  }

  if (!endCursor) {
    return {
      organization: data.organization,
      errors: undefined
    };
  }

  const { edges: oldIssues } = oldState.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;

  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues
        }
      }
    },
    errors: undefined
  };

}

const ADD_STAR = `
  mutation ($repoId: ID!) {
    addStar(input: {starrableId: $repoId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const addStarToRepo = repoId => axiosGitHubGraphQL.post('', {
  query: ADD_STAR,
  variables: { repoId }
});

const resolveStarMutation = mutationResults => oldState => {

  const { data, errors } = mutationResults.data;

  if (errors) {
    return {
      ...oldState,
      errors: errors
    };
  }

  const {
    viewerHasStarred
  } = data.addStar.starrable;

  return {
    ...oldState,
    organization: {
      ...oldState.organization,
      repository: {
        ...oldState.organization.repository,
        stargazers: {
          totalCount: oldState.organization.repository.stargazers.totalCount + 1
        },
        viewerHasStarred: viewerHasStarred
      }
    }
  };

};

const REMOVE_STAR = `
  mutation ($repoId: ID!) {
    removeStar(input: {starrableId: $repoId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const removeStarFromRepo = repoId => axiosGitHubGraphQL.post('', {
  query: REMOVE_STAR,
  variables: { repoId }
});

const ADD_REACTION = `
  mutation($subjectId: ID!, $content: ReactionContent!) {
    addReaction(input: {subjectId: $subjectId, content: $content}) {
      reaction {
        id
        content
        reactable {
          id
          viewerCanReact
        }
      }
    }
  }
`;

const addReactionToIssue = (subjectId, content) => axiosGitHubGraphQL.post('', {
  query: ADD_REACTION,
  variables: { subjectId, content }
});

const resolveAddReactionMutation = mutationResults => oldState => {

  const { data, errors } = mutationResults.data;

  if (errors) {
    return {
      ...oldState,
      errors: errors
    };
  }

  const { reaction } = data.addReaction;
  const { id: issueId } = reaction.reactable;
  const { edges: oldIssues } = oldState.organization.repository.issues;

  const newIssues = oldIssues.map(edge => {

    const { node } = edge;

    if (node.id === issueId) {

      const { reactions } = node;

      const newReactions = [
        { node: reaction },
        ...reactions.edges.filter(({ node }) => node.id !== reaction.id).slice(0, 2)
      ];

      return {
        ...edge,
        node: {
          ...node,
          reactions: {
            ...reactions,
            edges: newReactions
          }
        }
      };

    } else {
      return { ...edge };
    }

  });

  return {
    ...oldState,
    organization: {
      ...oldState.organization,
      repository: {
        ...oldState.organization.repository,
        issues: {
          ...oldState.organization.repository.issues,
          edges: newIssues
        }
      }
    }
  };

};

const resolveUnstarMutation = mutationResults => oldState => {

  const { data, errors } = mutationResults.data;

  if (errors) {
    return {
      ...oldState,
      errors: errors
    };
  }

  const {
    viewerHasStarred
  } = data.removeStar.starrable;

  return {
    ...oldState,
    organization: {
      ...oldState.organization,
      repository: {
        ...oldState.organization.repository,
        stargazers: {
          totalCount: oldState.organization.repository.stargazers.totalCount - 1
        },
        viewerHasStarred: viewerHasStarred
      }
    }
  };

};


class App extends Component {

  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: undefined,
    errors: undefined
  }

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = event => {
    this.setState({ path: event.target.value });
  };

  onSubmit = event => {

    this.onFetchFromGitHub(this.state.path);

    event.preventDefault();

  };

  onFetchFromGitHub = (path, endCursor) => {

    getIssuesFromRepo(path, endCursor)
      .then(queryResult =>
        this.setState(resolveIssuesFromQuery(queryResult, endCursor))
      ).catch(e =>
        this.setState(() => ({ errors: [{ message: 'Unsuccessful request' }] }))
      );

  };

  onFetchMoreIssues = () => {

    const {
      endCursor
    } = this.state.organization.repository.issues.pageInfo;

    this.onFetchFromGitHub(this.state.path, endCursor);

  };


  onStarRepository = (repoId, viewerHasStarred) => {

    if (!viewerHasStarred) {

      addStarToRepo(repoId)
        .then(mutationResults => {
          this.setState(resolveStarMutation(mutationResults));
        })
        .catch(err => {
          this.setState({ errors: [{ message: 'Failed to star repo' }] });
        });

    } else {

      removeStarFromRepo(repoId)
        .then(mutationResults => {
          this.setState(resolveUnstarMutation(mutationResults));
        })
        .catch(err => {
          this.setState({ errors: [{ message: 'Failed to unstar repo' }] });
        });

    }

  }

  onReactionButtonClick = (subjectId, content) => {

    addReactionToIssue(subjectId, content)
      .then(mutationResults => {
        this.setState(resolveAddReactionMutation(mutationResults));
      })
      .catch(err => {
        this.setState({ errors: [{ message: 'Failed to add reaction' }] });
      });

    // console.error('[App] - onReactionButtonClick() - NOT IMPLEMENTED', subjectId, content);
  }

  render() {

    const { path, organization, errors } = this.state;

    console.log(this.state);

    return (
      <div>
        <h1>{title}</h1>
        <form onSubmit={this.onSubmit}>

          <label htmlFor="url">
            Show open issues for https://github.com/
          </label>
          <input id="url" type="text" onChange={this.onChange} value={path} />
          <button type="submit">Search</button>

        </form>

        <hr />

        {(organization || errors) ? (
          <Organization
            organization={organization}
            errors={errors}
            onFetchMoreIssues={this.onFetchMoreIssues}
            onStarRepository={this.onStarRepository}
            onReactionButtonClick={this.onReactionButtonClick}
          />
        ) : (
            <p>No information yet...</p>
          )}


      </div>
    );
  }
}

export default App;
