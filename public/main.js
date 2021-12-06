const { h, Fragment, createRef, render, Component } = window.preact;
const html = window.htm.bind(h);
const Router = window.preactRouter;
const { route } = Router;

var socket = io();

class Home extends Component {
  constructor(props) {
    super(props);
    this.joinInputRef = createRef(null);
    this.joinButtonRef = createRef(null);
    this.lastKnownLength = 0;
  }

  render() {
    return html`<div className='container'>
      <h1>Bug Bash Call Bell</h1>
      <h2>How it Works</h2>
      <p>
        <ul className='list-group list-group-numbered'>
          <li className='list-group-item'> Create a room</li>
          <li className='list-group-item'> Share screen and audio in the meeting</li>
          <li className='list-group-item'> Others join</li>
          <li className='list-group-item'> Everyone can trigger the bell</li>
        </ul>
      </p>
      <p>
        <button className='bn632-hover' onClick=${this.createRoom.bind(this)}>
          Create Room
        </button>
      </p>
      <p className='text-center my2'>
        or
        <hr className='hr-or'/>
      </p>
      <h2 className='mb2'>Join Room</h2>
      <p>
        <input ref=${this.joinInputRef} type="text" id="roomcode" maxlength="6" className="form-control" placeholder='123456' onkeyup=${this.onJoinKeyup.bind(this)} />
      </p>
      <p>
        <button className='bn632-hover' onClick=${this.joinRoom.bind(this)} ref=${this.joinButtonRef}>
          Join Room
        </button>
      </p>
    </div>`;
  }

  onJoinKeyup() {
    if (this.joinInputRef.current && this.joinButtonRef.current) {
      if (this.lastKnownLength === 5 && this.joinInputRef.current.value.length === 6) {
        this.joinButtonRef.current.focus();
      }
      this.lastKnownLength = this.joinInputRef.current.value.length;
    }
  }

  createRoom() {
    const randomRoomCode = (Math.floor(Math.random() * 89) + 10) * 10000;
    const secondsPastTheHour = Math.round(Date.now() / 1000) % 10000;
    const generatedRoomNumber = String(randomRoomCode + secondsPastTheHour).padEnd(6, '0');
    route('/host/' + generatedRoomNumber);
  }

  joinRoom() {
    route('/room/' + this.joinInputRef.current.value);
  }
}

const BELL_DURATION = 1000;
const BELL_CLICK_DELAY = 100;

class Room extends Component {
  constructor(props) {
    super(props);
    this.roomid = props.roomid;
    this.isHost = props.path.includes('/host/');
    this.isMounted = true;
    this.onDocumentKeypressBound = this.onDocumentKeypress.bind(this);
    if (this.isHost) {
      socket.emit('joinhost', this.roomid);
      socket.on('ringbell', this.triggerBell.bind(this));
    }
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.onDocumentKeypressBound);
    if (this.isHost) {
      setTimeout(this.runAudioCheck.bind(this), 5000);
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
    document.body.removeEventListener('keydown', this.onDocumentKeypressBound);
  }

  render() {
    const domain = window.location.origin.split('://')[1];
    const roomLink = `${domain}/room/${this.roomid}`;
    return html`<div className='container'>
      <h1>Bug Bash Bell</h1>
      ${this.state.showHostMessage ? html`<p className='bellMessage mb2'>Chrome is blocking sound playback, click bell once to enable</p>` : ''}
      <p>Press 'b' or click the bell ${!this.isHost ? ' to ring bell in host session' : ''}</p>
      ${this.renderBell()}
      <h2>To Join</h2>
      <p className='my2'>Visit <b>${domain}</b> and enter room code <b>${this.roomid}</b></p>
      <p>or</p>
      <p>Go directly to <a className='big-link' href='${roomLink}'>${roomLink}</a></p>
    </div>`;
  }

  renderBell() {
    return html`<${Fragment}>
    <svg onClick=${this.triggerBell.bind(this)} id='bell' className="${this.state.bellAnimate && 'animateBell'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 503.322 503.322" style="enable-background:new 0 0 503.322 503.322" xml:space="preserve">
      <path className='ringer' style="fill:#bdc3c7" d="M251.664 117.153a8.676 8.676 0 0 1-8.678-8.678V73.763c0-4.79 3.879-8.678 8.678-8.678s8.678 3.888 8.678 8.678v34.712a8.676 8.676 0 0 1-8.678 8.678"/>
      <path className='ringerStick' style="fill:#bdc3c7" d="M295.054 82.441h-86.78c-4.799 0-8.678-3.888-8.678-8.678s3.879-8.678 8.678-8.678h86.78c4.799 0 8.678 3.888 8.678 8.678s-3.879 8.678-8.678 8.678"/>
      <path style="fill:#667d8c" d="M0 438.237h503.322v-52.068H0z"/>
      <path style="fill:#f29c1e" d="M86.78 386.169h329.762v-34.711H86.78z"/>
      <path className='bellBody' style="fill:#f0c419" d="M17.359 351.458c0-134.196 100.109-242.983 234.305-242.983S485.97 217.262 485.97 351.458H17.359z"/>
      <path className='bellShine' style="fill:#ede61a" d="M60.376 299.398c-.79 0-1.579-.113-2.36-.33a8.671 8.671 0 0 1-5.996-10.709c22.346-79.169 84.975-136.912 163.432-150.71 4.712-.85 9.216 2.317 10.049 7.038.824 4.721-2.326 9.225-7.047 10.058-71.836 12.635-129.206 65.64-149.738 138.327a8.673 8.673 0 0 1-8.34 6.326"/>
    </svg>
    </${Fragment}>`;
  }

  triggerBell() {
    if (this.state.bellAnimate) {
      this.setState({
        showHostMessage: false,
        bellAnimate: false
      });
      requestAnimationFrame(() => {
        this.setState({
          bellAnimate: true
        });
      })
    } else {
      this.setState({
        showHostMessage: false,
        bellAnimate: true
      });
    }
    setTimeout(() => {
      this.makeBellSound();
    }, BELL_CLICK_DELAY)
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      if (this.isMounted) {
        this.setState({
          bellAnimate: false
        });
      }
    }, BELL_DURATION)
  }

  onDocumentKeypress(event) {
    if (event.keyCode === 66) {
      this.triggerBell();
    }
  }

  makeBellSound() {
    const isHost = location.href.includes('/host/');
    if (isHost) {
      new Audio('/public/bell.mp3').play();
    } else {
      socket.emit('ringbell', this.roomid);
    }
  }

  runAudioCheck() {
    new Audio('/public/empty.mp3').play()
    .then(() => {
      this.setState({
        showHostMessage: false
      });
    })
    .catch(error => {
      console.log(error);
      console.info('User has not interacted with document yet.');
      this.setState({
        showHostMessage: true
      });
      setTimeout(this.runAudioCheck.bind(this), 1000);
    });
  }
}

const AppRoot = function() {
  return html`
  <div>
  <${Router}>
    <${Home} path="/" />
    <${Room} path="/host/:roomid" />
    <${Room} path="/room/:roomid" />
  </${Router}>
  </div>
  `;
}

render(html`<${AppRoot} />`, document.getElementById('root'));
