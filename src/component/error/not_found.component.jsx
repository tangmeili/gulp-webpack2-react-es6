import img from '../../images/404.png'
class NotFound extends React.Component{
  render() {
    return (<img src={img} alt="" style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)'
    }}/>)
  }
}

export default NotFound