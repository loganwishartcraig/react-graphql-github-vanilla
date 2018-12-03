import React from 'react';

const Issue = ({ issue: { id, url, title } }) => (
    <>
        <li>
            <a href={url}>{title}</a>
        </li>
    </>
);

export default Issue;
