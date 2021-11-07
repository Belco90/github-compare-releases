import { useState, useEffect } from 'react'
import gfm from 'remark-gfm'
import parse from 'remark-parse'
import { unified } from 'unified'

import {
  MiscGroupTitles,
  ProcessedRelease,
  ProcessedReleasesCollection,
  Release,
} from '~/models'
import { getReleaseGroupTitle } from '~/utils'

function insertReleaseInGroup(
  newProcessedRelease: ProcessedRelease,
  groupedReleases: ProcessedReleasesCollection
): void {
  const { title } = newProcessedRelease
  if (groupedReleases[title]) {
    // Group already exists, then append new changes of same type
    groupedReleases[title].push(newProcessedRelease)
  } else {
    // Group doesn't exist yet, then create it and init with new changes
    groupedReleases[title] = [newProcessedRelease]
  }
}

function processedReleaseIsEmpty(processedRelease: ProcessedRelease): boolean {
  return processedRelease.descriptionMdast.children.length === 0
}

const processor = unified().use(parse).use(gfm)

async function processReleasesAsync(
  releases: Array<Release>
): Promise<ProcessedReleasesCollection> {
  // TODO: reject on error
  return new Promise((resolve) => {
    const processedReleasesCollection: ProcessedReleasesCollection = {}

    releases.forEach((rel) => {
      const { body, ...remainingRel } = rel

      if (!body) {
        return
      }

      const mdastDescription = processor.parse(body)

      let newProcessedRelease: ProcessedRelease | undefined
      mdastDescription.children.forEach((mdastNode) => {
        const nodeChildren = 'children' in mdastNode ? mdastNode.children : null
        const originalTitle =
          nodeChildren && 'value' in nodeChildren[0]
            ? nodeChildren[0].value
            : 'unknown'

        if (
          mdastNode.type === 'heading' &&
          [1, 2, 3].includes(mdastNode.depth)
        ) {
          // Check if prev release available, and save it if so...
          if (
            newProcessedRelease &&
            !processedReleaseIsEmpty(newProcessedRelease)
          ) {
            insertReleaseInGroup(
              newProcessedRelease,
              processedReleasesCollection
            )
          }

          // ... and create new release if proper header found
          const title = getReleaseGroupTitle(mdastNode)
          if (title) {
            newProcessedRelease = {
              title,
              originalTitle,
              descriptionMdast: {
                type: 'root',
                children: [],
              },
              ...remainingRel,
            }
          }
        } else if (newProcessedRelease) {
          // Append content to current release
          newProcessedRelease.descriptionMdast.children.push(mdastNode)
        } else {
          // Standalone or non-groupable release found
          newProcessedRelease = {
            title: MiscGroupTitles.unknown,
            originalTitle,
            descriptionMdast: {
              type: 'root',
              children: [mdastNode],
            },
            ...remainingRel,
          }
        }
      })
      // Insert final release in group
      if (
        newProcessedRelease &&
        !processedReleaseIsEmpty(newProcessedRelease)
      ) {
        insertReleaseInGroup(newProcessedRelease, processedReleasesCollection)
      }
    })
    resolve(processedReleasesCollection)
  })
}

interface UseProcessReleasesReturn {
  processedReleases: ProcessedReleasesCollection | null
  isProcessing: boolean
}

function useProcessReleases(
  releases: Array<Release> | null
): UseProcessReleasesReturn {
  const [processedReleases, setProcessedReleases] =
    useState<ProcessedReleasesCollection | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleProcessReleases = async () => {
      if (!releases || releases.length === 0) {
        setProcessedReleases(null)
      } else {
        setIsProcessing(true)
        const result = await processReleasesAsync(releases)
        setProcessedReleases(result)
      }

      setIsProcessing(false)
    }

    void handleProcessReleases()
  }, [releases])

  return { processedReleases, isProcessing }
}

export default useProcessReleases
