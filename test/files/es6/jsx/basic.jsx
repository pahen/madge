import React from 'react';
import other from './other';

export default React.createClass({
  render: function() {
    return <div>
      foo
      {this.props.children}
    </div>
  }
});

