import { createElement, ReactNode, useEffect, useMemo, useState } from 'react'
import rehypeHighlight from 'rehype-highlight'
import rehype2react from 'rehype-react'
import gfm from 'remark-gfm'
import parse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import markdown from 'remark-stringify'
import { unified } from 'unified'
import { Parent } from 'unist'

import { ComponentsMapping, Repository } from '~/models'

interface HookArgs {
  repository: Repository
  description: Parent
  componentsMapping: ComponentsMapping
}

interface HookReturnedValue {
  processedDescription: ReactNode
  isProcessing: boolean
}

async function processDescriptionAsync(
  description: Parent,
  components: ComponentsMapping
): Promise<ReactNode> {
  return new Promise((resolve, reject) => {
    unified()
      .use(parse)
      .use(gfm)
      .use(remark2rehype)
      .use(rehypeHighlight, { ignoreMissing: true })
      .use(rehype2react, {
        createElement,
        components,
      })
      .process(
        unified().use(markdown).use(gfm).stringify(description),
        (err, file) => {
          if (err || !file) {
            reject(err)
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            resolve(file.result as ReactNode)
          }
        }
      )
  })
}

function useProcessDescriptionMdast({
  repository,
  description,
  componentsMapping,
}: HookArgs): HookReturnedValue {
  const [processedDescription, setProcessedDescription] =
    useState<ReactNode | null>(null)

  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleProcessDescription = async () => {
      setIsProcessing(true)
      const result = await processDescriptionAsync(
        description,
        componentsMapping
      )

      setProcessedDescription(result)
      setIsProcessing(false)
    }

    void handleProcessDescription()
  }, [componentsMapping, description, repository.html_url])

  const data = useMemo(
    () => ({
      processedDescription,
      isProcessing,
    }),
    [isProcessing, processedDescription]
  )

  return data
}

export default useProcessDescriptionMdast
