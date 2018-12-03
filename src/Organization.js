import React from 'react';
import Repository from './Repository';

const Organization = ({
    organization,
    errors,
    onFetchMoreIssues,
    onStarRepository
}) => {

    if (errors) {
        return (
            <div>
                <p>
                    <strong>Something went wrong:</strong>
                </p>
                <ul>
                    {errors.map(error => <li>{error.message}</li>)}
                </ul>
            </div>
        );
    } else {
        return (
            <div>
                <p>
                    <strong>Issues from Organization:</strong>
                    <a href={organization.url}>{organization.name}</a>
                </p>
                <Repository
                    repository={organization.repository}
                    onFetchMoreIssues={onFetchMoreIssues}
                    onStarRepository={onStarRepository}
                />
            </div>
        )
    }

};

export default Organization;
