import {describe, it, beforeEach, before, after, afterEach } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import TodoService from '../src/todoService.js';
import Todo from '../src/todo.js';
import sinon from 'sinon';
describe('todoService test suite', ()=> {
      describe('#list', ()=> {
            let _todoService;
            let _dependencies;
            const mockDatabase =[
              {
                text: 'I must plan my trip to Europe',
                when: new Date('2021-03-22'),
                status: 'late',
                id: '8b1a8289-b8a8-4414-b6f5-50ab040d0b3d'
              }
            ] 
            beforeEach((context) => {
                _dependencies = {
                todoRepository:{
                  list:  context.mock.fn(async()=> mockDatabase)
                }
              }
              _todoService = new TodoService(_dependencies);
          });
          it('should return a list of item uppercase text', async() => {
              const expected = mockDatabase.map(({text,...result}) => (new Todo({text: text.toUpperCase(),...result})));
              const result = await _todoService.list();
              assert.deepStrictEqual(result, expected);
              const fnMock = _dependencies.todoRepository.list.mock;
              assert.strictEqual(fnMock.callCount(),1);
          })
     })

     describe('#create', ()=> {
        let  _todoService;
        let _dependencies;
        let _sandbox;
        const mockDatabase ={
          text: 'I must plan my trip to Europe',
          when: new Date('2021-03-22T00:00:00.000Z'),
          status: 'late',
          id: 'f4395f72-d878-4e90-a487-cdd2781a3fac'
        };
        const default_id = mockDatabase.id;
        before(()=>{
          crypto.randomUUID = () => default_id;
          _sandbox = sinon.createSandbox();
        });
        after(async()=>{
          crypto.randomUUID = (await import('node:crypto')).randomUUID;
        })
        afterEach(()=> _sandbox.restore())
        beforeEach((context) => {
          _dependencies = {
          todoRepository:{
            create:  context.mock.fn(async()=> mockDatabase)
          }
        }
        _todoService = new TodoService(_dependencies);
        });

        it (`shouldn't create todo item with invalidate date`,async()=>{
          const input = new Todo({
            text:'',
            when:''
          });
          const expected = 
          {
            error: {
                      message: 'invalid data',
                      data: 
                      {
                        text:'',
                        when:'',
                        status:'',
                        id:default_id
                      }
                   }
          };
          const result = await _todoService.create(input);
          assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(expected));
        })

        it (`shouldn't create todo item with late status when the property is further than today`,async()=>{
          const properties={
            text:'I must plan my trip to Europe',
            when: new Date('2020-03-23T00:00:00.000Z')
          }
          const expected= {
            ...properties,
            status:'late',
            id:default_id
          }
          const input = new Todo(properties);
          const today = new Date('2020-03-24T00:00:00.000Z');
          _sandbox.useFakeTimers(today.getTime());
          await _todoService.create(input);
          const fnMock = _dependencies.todoRepository.create.mock;
          assert.strictEqual(fnMock.callCount(),1);
          assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected);
        });

        it (`shouldn't create todo item with pending status when the property is in this past`,async()=>{
          const properties={
            text:'I must plan my trip to Europe',
            when: new Date('2020-03-24T00:00:00.000Z')
          }
          const expected= {
            ...properties,
            status:'pending',
            id:default_id
          }
          const input = new Todo(properties);
          const today = new Date('2020-03-23T00:00:00.000Z');
          _sandbox.useFakeTimers(today.getTime());
          await _todoService.create(input);
          const fnMock = _dependencies.todoRepository.create.mock;
          assert.strictEqual(fnMock.callCount(),1);
          assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected);
        });
    });
});