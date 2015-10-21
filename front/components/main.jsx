import React from 'react';  
import {Link} from 'react-router';

class Main extends React.Component {  
  render() {
    return (
      <div>
        <h1>Example</h1>
        <Link to='/example'>Go to the Example page...</Link>
      </div>
    );
  }
}

export default Main;  
