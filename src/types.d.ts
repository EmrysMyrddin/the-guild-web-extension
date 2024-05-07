type SearchTaskRequest = { type: 'searchTaskFromGithubURL'; url: string }
type Message = { type?: never } | SearchTaskRequest

type SearchTaskResult =
  | { status: 'found'; notionURL: string }
  | { status: 'not_found' }
  | { status: 'not_tracked' }
  | { status: 'error'; error: string }

type MessageHandler = (
  message: Message,
  sender: unknown,
  sendResponse: (res: SearchTaskResult) => void,
) => true
