import React from 'react';

type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const PageSection: React.FC<Props> = ({ title, actions, children }) => (
  <section className="page-section">
    <header>
      <h2>{title}</h2>
      {actions}
    </header>
    {children}
  </section>
);
