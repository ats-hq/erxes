import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { AutoAndManualForm } from '../components';
import { queries, mutations } from '../graphql';
import withFormMutations from './withFormMutations';

const AutoAndManualFormContainer = props => {
  const {
    segmentsQuery,
    headSegmentsQuery,
    combinedFieldsQuery,
    segmentsAddQuery,
    emailTemplatesQuery,
    customerCountsQuery,
    engageMessageDetailQuery,
    brandsQuery,
    kind
  } = props;

  const message = engageMessageDetailQuery.engageMessageDetail || [];
  const brands = brandsQuery.brands || [];

  const customerCounts = customerCountsQuery.customerCounts || {
    all: 0,
    byBrand: {},
    byIntegrationType: {},
    bySegment: {},
    byTag: {}
  };

  const segmentFields = combinedFieldsQuery.fieldsCombinedByContentType
    ? combinedFieldsQuery.fieldsCombinedByContentType.map(
        ({ name, label }) => ({
          _id: name,
          title: label,
          selectedBy: 'none'
        })
      )
    : [];

  const count = segment => {
    customerCountsQuery.refetch({
      byFakeSegment: segment
    });
  };

  const segmentAdd = ({ doc }) => {
    segmentsAddQuery({ variables: { ...doc } }).then(() => {
      segmentsQuery.refetch();
      customerCountsQuery.refetch();
      Alert.success('Success');
    });
  };

  const updatedProps = {
    ...props,
    headSegments: headSegmentsQuery.segmentsGetHeads || [],
    segmentFields,
    segmentAdd,
    segments: segmentsQuery.segments || [],
    templates: emailTemplatesQuery.emailTemplates || [],
    customerCounts: customerCounts.bySegment || {},
    count,
    kind: message ? message.kind : kind,
    brands
  };

  return <AutoAndManualForm {...updatedProps} />;
};

AutoAndManualFormContainer.propTypes = {
  segmentsQuery: PropTypes.object,
  emailTemplatesQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object,
  headSegmentsQuery: PropTypes.object,
  combinedFieldsQuery: PropTypes.object,
  segmentsAddQuery: PropTypes.func,
  kind: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  brandsQuery: PropTypes.object
};

export default withFormMutations(
  compose(
    graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
    graphql(gql(queries.segments), { name: 'segmentsQuery' }),
    graphql(gql(queries.customerCounts), { name: 'customerCountsQuery' }),
    graphql(gql(queries.headSegments), { name: 'headSegmentsQuery' }),
    graphql(gql(queries.combinedFields), { name: 'combinedFieldsQuery' }),
    graphql(gql(mutations.segmentsAdd), { name: 'segmentsAddQuery' }),
    graphql(gql(queries.engageMessageDetail), {
      name: 'engageMessageDetailQuery',
      options: ({ messageId }) => ({
        variables: {
          _id: messageId
        }
      })
    }),
    graphql(gql(queries.brands), { name: 'brandsQuery' })
  )(AutoAndManualFormContainer)
);
