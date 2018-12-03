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

    console.log('onStarRepository', repoId, viewerHasStarred)

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
          />
        ) : (
            <p>No information yet...</p>
          )}


      </div>
    );
  }
}

export default App;