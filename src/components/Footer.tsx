import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/core';
import GitHubButton from 'react-github-btn';
import Container from 'components/Container';
import { REPO_URL } from 'global';

const Footer = () => {
  return (
    <Box as="footer" bg="gray.50" flexShrink={0}>
      <Container py={5}>
        <Flex justify="space-between" alignItems="center">
          <Box fontSize={{ base: 'md', md: 'lg' }}>
            Created with{' '}
            <span role="img" aria-label="Love">
              🧡
            </span>{' '}
            by{' '}
            <Link href="https://mario.dev/" color="orange.500" isExternal>
              Mario
            </Link>
          </Box>
          <Box mb="-8px">
            <GitHubButton
              href={REPO_URL}
              data-icon="octicon-star"
              data-size="large"
              data-show-count
              aria-label="Star Belco90/github-compare-releases on GitHub"
            >
              Star
            </GitHubButton>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
