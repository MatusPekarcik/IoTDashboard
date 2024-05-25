
import React, { Component, createRef } from 'react';
import { CardBody, CardContainer, CardItem } from "./3d-card.jsx";

export class MyCardItem extends Component {

constructor(props) {
    super(props);
}

render() {
  return (
<>
    {this.props.use3D &&( 
        <CardItem {...this.props}>
        {this.props.children}
        </CardItem>
    )}

    {!this.props.use3D &&( 
        <div  {...this.props}>
        {this.props.children}
        </div>
    )}
</> )               
}    
}

export class MyCardBody extends Component {

    constructor(props) {
        super(props);
    }
    
    render() {
      return (
    <>
        {this.props.use3D &&( 
            <CardBody {...this.props}>
            {this.props.children}
            </CardBody>
        )}
    
        {!this.props.use3D &&( 
            <div  {...this.props}>
            {this.props.children}
            </div>
        )}
    </> )               
    }    
}

export class MyCardContainer extends Component {

    constructor(props) {
        super(props);
    }
        
    render() {
        return (
    <>
        {this.props.use3D &&( 
            <CardContainer {...this.props}>
            {this.props.children}
            </CardContainer>
        )}
        
        {!this.props.use3D &&( 
            <div  {...this.props}>
            {this.props.children}
            </div>
        )}
    </> )               
    }    
}