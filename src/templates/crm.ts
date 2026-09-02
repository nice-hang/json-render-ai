import type { AppSpec } from '../core'

export const crmSpec: AppSpec = {
  version: 1,
  rootId: 'crm-page',
  nodes: {
    'crm-page': {
      id: 'crm-page',
      type: 'Page',
      props: { title: 'Northstar CRM' },
      children: ['crm-layout'],
    },
    'crm-layout': {
      id: 'crm-layout',
      type: 'Stack',
      props: { direction: 'column', gap: 20 },
      children: ['crm-intro', 'metrics-grid', 'pipeline-card'],
    },
    'crm-intro': {
      id: 'crm-intro',
      type: 'Text',
      props: {
        content: 'Good morning, Maya. Here is your pipeline at a glance.',
        tone: 'muted',
      },
      children: [],
    },
    'metrics-grid': {
      id: 'metrics-grid',
      type: 'Stack',
      props: { direction: 'row', gap: 14 },
      children: ['revenue-card', 'deals-card', 'win-rate-card'],
    },
    'revenue-card': {
      id: 'revenue-card',
      type: 'Card',
      props: { title: 'Pipeline value' },
      children: ['revenue-metric'],
    },
    'revenue-metric': {
      id: 'revenue-metric',
      type: 'Metric',
      props: { label: 'Open pipeline', value: '$482K' },
      children: [],
    },
    'deals-card': {
      id: 'deals-card',
      type: 'Card',
      props: { title: 'Active deals' },
      children: ['deals-metric'],
    },
    'deals-metric': {
      id: 'deals-metric',
      type: 'Metric',
      props: { label: 'In progress', value: '24' },
      children: [],
    },
    'win-rate-card': {
      id: 'win-rate-card',
      type: 'Card',
      props: { title: 'Win rate' },
      children: ['win-rate-metric'],
    },
    'win-rate-metric': {
      id: 'win-rate-metric',
      type: 'Metric',
      props: { label: 'Last 30 days', value: '31%' },
      children: [],
    },
    'pipeline-card': {
      id: 'pipeline-card',
      type: 'Card',
      props: { title: 'Pipeline filters' },
      children: ['filter-row'],
    },
    'filter-row': {
      id: 'filter-row',
      type: 'Stack',
      props: { direction: 'row', gap: 12 },
      children: ['search-input', 'stage-select', 'apply-button'],
    },
    'search-input': {
      id: 'search-input',
      type: 'Input',
      props: { label: 'Account', placeholder: 'Search accounts' },
      children: [],
    },
    'stage-select': {
      id: 'stage-select',
      type: 'Select',
      props: {
        label: 'Stage',
        options: ['All stages', 'Qualified', 'Proposal', 'Negotiation'],
      },
      children: [],
    },
    'apply-button': {
      id: 'apply-button',
      type: 'Button',
      props: { label: 'Apply filters', variant: 'primary' },
      children: [],
    },
  },
}
