import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// Write create todo function
export async function createTodo(
{ newTodo, userId }: { newTodo: CreateTodoRequest; userId: string; }): Promise<TodoItem> {
  logger.info('Create todo function called') 
  
    
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachmenetUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachementUrl: s3AttachmenetUrl,
    ...newTodo 
  }

  return await todosAccess.createTodo(newItem)
}

export async function getTodoItem(todoId: string, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken)
    return await todosAccess.getTodoItem(todoId, userId)
  }

export async function setItemUrl(todoId: string, itemUrl: string, jwtToken: string): Promise<void> {
    console.log("Setting Item URL")
    console.log(itemUrl)
    console.log(todoId)
    const userId = parseUserId(jwtToken)
    const todoItem = await todosAccess.getTodoItem(todoId, userId)
  
    todosAccess.setItemUrl(todoItem.todoId, todoItem.createdAt, itemUrl);
  }
  
  export async function updateTodo(
      todoId: string, 
      updateTodoRequest: UpdateTodoRequest,
      jwtToken: string
    ): Promise<void> {
      console.log("Updating Item")
      console.log(updateTodoRequest)
      console.log(todoId)
      const userId = parseUserId(jwtToken)
  
      const todoItem = await todosAccess.getTodoItem(todoId, userId)
    
      // Using todoId here to make sure it's actually the users todoItem
      await todosAccess.updateTodo(todoItem.todoId, todoItem.createdAt, {
        name: updateTodoRequest.name,
        done: updateTodoRequest.done,
        dueDate: updateTodoRequest.dueDate,
      })
  }
  
  export async function deleteTodo(
      itemId: string,
      jwtToken: string
    ): Promise<void> {
      
      const userId = parseUserId(jwtToken)
      const todoItem = await todosAccess.getTodoItem(itemId, userId)
      await todosAccess.deleteTodo(todoItem.todoId, todoItem.createdAt)
  }
  