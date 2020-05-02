import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Skeleton,
  Stack,
} from '@chakra-ui/core';
import useProcessReleases from 'hooks/useProcessReleases';
import { ProcessedReleaseChange, Release, Repository } from 'models';
import React from 'react';
import { filterReleasesByVersionRange } from 'utils';

import ProcessedReleaseChangeDescription from '~/components/ProcessedReleaseChangeDescription';
import RepositoryReleasesChangelogHeading from '~/components/RepositoryReleasesChangelogHeading';
import TextSkeleton from '~/components/TextSkeleton';

interface RepositoryReleasesChangelogProps {
  repository: Repository;
  fromVersion: string;
  toVersion: string;
}

const RepositoryReleasesChangelog = ({
  repository,
  fromVersion,
  toVersion,
}: RepositoryReleasesChangelogProps) => {
  const [filteredReleases, setFilteredReleases] = React.useState<
    Release[] | null
  >(null);

  const { processedReleases, isProcessing } = useProcessReleases(
    filteredReleases
  );

  const { releases, ...repoInfo } = repository;

  React.useEffect(
    function filterReleases() {
      if (releases && fromVersion && toVersion) {
        setFilteredReleases(
          filterReleasesByVersionRange({
            releases,
            from: fromVersion,
            to: toVersion,
          })
        );
      } else {
        setFilteredReleases(null);
      }
    },
    [releases, fromVersion, toVersion]
  );

  // TODO: simplify conditional renders with state machine
  return (
    <>
      <RepositoryReleasesChangelogHeading
        repository={repository}
        fromVersion={fromVersion}
        toVersion={toVersion}
      />

      {isProcessing && (
        <>
          <Skeleton width="20%" height={8} mb={4} />
          <TextSkeleton />
        </>
      )}

      {!isProcessing && processedReleases && (
        <Stack spacing={6}>
          {Object.keys(processedReleases).map((title: string) => (
            <Box key={title}>
              <Heading as="h2" size="xl" mb={4}>
                {title}
              </Heading>
              <Box mb={4}>
                {processedReleases[title].map(
                  (processedReleaseChange: ProcessedReleaseChange) => (
                    <ProcessedReleaseChangeDescription
                      key={processedReleaseChange.id}
                      repository={repoInfo}
                      processedReleaseChange={processedReleaseChange}
                      mb={8}
                    />
                  )
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {fromVersion && toVersion && !processedReleases && !isProcessing && (
        <Alert status="error">
          <AlertIcon />
          No processed releases to show
        </Alert>
      )}
    </>
  );
};

export default RepositoryReleasesChangelog;
