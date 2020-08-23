import React from 'react';
import ReactDom from 'react-dom';
import { Slot } from '../src/slot';
import { reactive } from '@vue/reactivity';
import { useReactiveState } from '@typeclient/react-effect';

const store = reactive<{ next: boolean }>({
  next: false,
})
ReactDom.render(React.createElement(App), document.getElementById('app'));

function App() {
  return <Slot>
    <h1>Title</h1>
    <Slot.Consumer name="header">
      <span style={{ color: 'red' }}>default slot for header</span>
    </Slot.Consumer>
    <div>next is default</div>
    <Slot.Consumer>
      <span style={{ color: 'red' }}>default slot for default</span>
    </Slot.Consumer>
    <hr/>
    <Custom />
    <div>footer</div>
  </Slot>
}

function Custom() {
  const next = useReactiveState(() => store.next);
  console.log('next', next);
  return <div>
    user
    {/* {next ? null : <Slot.Provider name="header">this is slot area: header</Slot.Provider>} */}
    <Slot.Provider name="header">this is slot area: header</Slot.Provider>
    {next ? null : <Slot.Provider>this is slot area: default</Slot.Provider>}
    {/* <Slot.Provider>this is slot area: default</Slot.Provider> */}
  </div>
}

setTimeout(() => {
  store.next = true;
}, 3000);