/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-includes */
/* eslint-disable @typescript-eslint/no-for-in-array */
const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')

function createMessage(pytestResult: any): string {
  const file = fs.readFileSync(pytestResult)
  const newString = new String(file)

  const lineOfText = newString.split('\n')
  let startKey = '0'
  let newMessage = '### :white_check_mark: Result of Pytest Coverage\n'
  let lastMessage = ''
  let delLine = ''
  for (const i in lineOfText) {
    if (lineOfText[i].indexOf('coverage: platform') >= 0) {
      startKey = i
      newMessage += `\n${lineOfText[i]}\n`
      delete lineOfText[i]
      const iNext = parseInt(i) + 1
      delLine = iNext.toString()
      newMessage +=
        '| Name | Stmts | Miss | Cover |\n| :--- | ----: | ---: | ----: |\n'
    }
    if (i === delLine) {
      delete lineOfText[i]
    }
    if (startKey !== '0' && lineOfText[i] !== undefined) {
      if (
        lineOfText[i].indexOf(
          '---------------------------------------------------------'
        ) >= 0
      ) {
        delete lineOfText[i]
      } else if (lineOfText[i].indexOf('passed in') >= 0) {
        lastMessage += `\n~${lineOfText[i].replace(/=/g, '')}~`
        delete lineOfText[i]
      }
      if (lineOfText[i] !== undefined) {
        const tabOfText = lineOfText[i].split(/\s+/)
        for (const t in tabOfText) {
          if (tabOfText[t] !== '') {
            // Handle __init__.py 
            const escapedText = tabOfText[t].replaceAll('__', '\\_\\_');
            tabOfText[t] = `| ${escapedText}`
          } else {
            delete tabOfText[t]
          }
        }
        if (tabOfText[3] !== undefined) {
          newMessage += `${
            tabOfText[0] + tabOfText[1] + tabOfText[2] + tabOfText[3]
          }|\n`
        }
      }
    }
  }
  return newMessage + lastMessage
}

async function run(): Promise<void> {
  if (github.context.eventName !== 'pull_request') {
    core.info('Comment only will be created on pull requests!')
    return
  }

  const githubToken = core.getInput('token')
  const pytestFileName = core.getInput('pytest-coverage')

  const message = createMessage(pytestFileName)

  const context = github.context
  const pullRequestNumber = context.payload.pull_request?.number

  const octokit = github.getOctokit(githubToken)

  // Now decide if we should issue a new comment or edit an old one
  const {data: comments} = await octokit.issues.listComments({
    ...context.repo,
    issue_number: pullRequestNumber ?? 0
  })

  const comment = comments.find((comment: any) => {
    return (
      comment.user.login === 'github-actions[bot]' &&
      comment.body.startsWith(
        '### :white_check_mark: Result of Pytest Coverage\n'
      )
    )
  })

  if (comment) {
    await octokit.issues.updateComment({
      ...context.repo,
      comment_id: comment.id,
      body: message
    })
  } else {
    await octokit.issues.createComment({
      ...context.repo,
      issue_number: pullRequestNumber ?? 0,
      body: message
    })
  }
}

// eslint-disable-next-line github/no-then
run().catch(error => core.setFailed(`Workflow failed! ${error.message}`))
