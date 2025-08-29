import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@material-ui/core";
import { useSelector } from 'react-redux';
import { controller, initialState, IStates } from '../utils/StatesController';
import { WebviewWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import * as wt from 'worker-timers';

interface Props {

}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '20px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '280px'
  },
  timer: {
    fontSize: '50px',
    fontWeight: 600,
    color: 'white',
    fontFamily: '"SF Mono", monospace',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
    textAlign: 'center',
    lineHeight: 1.1,
    marginBottom: '32px',
    transition: 'transform 0.5s ease-out, font-size 0.3s ease-out',
    '&.running': {
      fontSize: '54px',
    },
    '&.heartbeat': {
      animation: '$heartbeat 0.6s ease-out',
    }
  },
  '@keyframes heartbeat': {
    '0%': {
      transform: 'scale(1)',
    },
    '30%': {
      transform: 'scale(1.08)',
      textShadow: '0 4px 20px rgba(255,255,255,0.3)',
    },
    '100%': {
      transform: 'scale(1)',
    }
  },
  inputs: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: '6px',
      height: '36px',
      '& input': {
        color: 'white',
        fontSize: '13px',
        textAlign: 'center',
        padding: '8px 4px'
      },
      '& fieldset': {
        border: 'none'
      },
      '&.Mui-disabled': {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        '& input': {
          color: 'rgba(255, 255, 255, 0.4)',
        }
      }
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '11px',
      transform: 'translate(10px, -14px) scale(0.75)',
      '&.Mui-focused, &.MuiFormLabel-filled': {
        transform: 'translate(10px, -14px) scale(0.75)',
      },
      '&.Mui-disabled': {
        color: 'rgba(255, 255, 255, 0.3)',
      }
    }
  },
  helpButton: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    minWidth: 'unset',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    }
  },
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: '#ff6b6b',
      color: 'white',
      borderRadius: '12px',
      margin: '20px',
      maxWidth: '280px',
    }
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 600,
    paddingBottom: '8px'
  },
  dialogContent: {
    paddingTop: '0px',
    '& p': {
      marginBottom: '12px',
      fontSize: '14px',
      lineHeight: 1.4
    },
    '& strong': {
      fontWeight: 600,
      color: '#fff'
    }
  },
  mainButton: {
    background: 'white',
    color: '#e55039',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    textTransform: 'none' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    marginBottom: '12px',
    '&:hover': {
      background: '#f8f8f8',
    }
  },
  breakButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '13px',
    fontWeight: 500,
    textTransform: 'none' as const,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
    '&:disabled': {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }
  }
}));

const STORED_STATE = "STORED_STATE"
var intervalObj = null
var appWindow: WebviewWindow = null

const index: React.FC<Props> = () => {
  const states = useSelector(() => controller.states);
  const classes = useStyles();
  const [isHeartbeat, setIsHeartbeat] = useState(false);
  const [prevTimer, setPrevTimer] = useState(states.currentTimer);
  const [helpOpen, setHelpOpen] = useState(false);

  const bringToFocus = async () => {
    await appWindow.unminimize()
    await appWindow.show()
    await appWindow.setFullscreen(true)
    await appWindow.setAlwaysOnTop(true)
    await appWindow.setFocus()
  }

  const setOriginalSize = async () => {
    await appWindow.show()
    await appWindow.setFullscreen(false)
    await appWindow.setAlwaysOnTop(false)
    await appWindow.unmaximize()
    await appWindow.setFocus()
  }

  useEffect(() => {
    const savedStateObj = getInitStateObj()
    controller.setState(savedStateObj)

    if (typeof window !== "undefined") {
      import('@tauri-apps/api/window').then((obj) => {
        appWindow = obj.appWindow

        appWindow.onResized((size) => {
          // console.log(`onResized`, size)
          if (size.payload.height === 0 && size.payload.width === 0) {
            appWindow.hide()
          }
        })
      })

      listen('single-instance', ({ event, payload, id, windowLabel }) => {
        appWindow.setFocus()
      })
    }

  }, [])

  useEffect(() => {
    setPrevTimer(states.currentTimer);
    
    if (states.pomoState !== 'idle') {
      setIsHeartbeat(false);
      // Force a brief delay then trigger heartbeat
      const startBeat = setTimeout(() => {
        setIsHeartbeat(true);
        const endBeat = setTimeout(() => setIsHeartbeat(false), 600);
        return () => clearTimeout(endBeat);
      }, 50);
      return () => clearTimeout(startBeat);
    }
  }, [states.currentTimer, states.pomoState]);

  const getInputValue = (e: any) => {
    if (e.target.value == '') {
      e.target.value = '0'
    };
    var value = parseInt(e.target.value)
    return value
  }

  const saveStateObj = () => {
    localStorage.setItem(STORED_STATE, JSON.stringify(controller.states))
  }

  const getInitStateObj = (): IStates => {
    const savedState: IStates = JSON.parse(localStorage.getItem(STORED_STATE))
    if (savedState) {
      return {
        ...savedState,
        pomoState: 'idle',
        currentTimer: savedState.workTime * 60
      }
    }
    else {
      return {
        ...initialState,
        pomoState: 'idle',
        currentTimer: initialState.workTime * 60
      }
    }
  }

  const getButtonText = () => {
    if (states.pomoState == 'idle') {
      return "Start Session"
    }
    else {
      return "Stop Timer"
    }
  }

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  };

  const startWorkTimer = () => {
    console.log("START")
    controller.setState({
      pomoState: 'work'
    })
    const warningSound = new Audio('warning.mp3')
    const finishSound = new Audio('finish.mp3')
    var timerNow = controller.states.currentTimer;

    intervalObj = wt.setInterval(() => {
      timerNow--

      if (timerNow < 0) {
        if (controller.states.pomoState == 'work') {
          timerNow = controller.states.breakTime * 60

          controller.setState({
            currentTimer: timerNow,
            pomoState: 'break'
          })
          bringToFocus()
        }
        else if (controller.states.pomoState == 'break') {
          stopWorkTimer()
        }
        finishSound.play()
      }
      else {
        if (timerNow <= controller.states.warningSecs) {
          warningSound.play()
        }

        controller.setState({
          currentTimer: timerNow
        })
      }

    }, 1000)
  }

  const stopWorkTimer = () => {
    console.log("STOP")
    wt.clearInterval(intervalObj)
    controller.setState({
      pomoState: 'idle',
      currentTimer: controller.states.workTime * 60
    })
    intervalObj = null
    setOriginalSize()
  }

  return (
    <div className={classes.root}>
      <Button 
        className={classes.helpButton}
        onClick={() => setHelpOpen(true)}
      >
        ?
      </Button>
      
      <div className={classes.container}>
        <div className={`${classes.timer} ${states.pomoState !== 'idle' ? 'running' : ''} ${isHeartbeat ? 'heartbeat' : ''}`}>
          {formatTime(states.currentTimer)}
        </div>
        
        <div className={classes.inputs}>
          <TextField
            className={classes.input}
            size="small"
            disabled={states.pomoState !== 'idle'}
            onChange={(e) => {
              const value = getInputValue(e);
              controller.setState({
                workTime: value,
                currentTimer: value * 60,
              })
            }}
            label="Work (min)"
            variant="outlined"
            value={states.workTime}
            type="number"
          />
          <TextField
            className={classes.input}
            size="small"
            disabled={states.pomoState !== 'idle'}
            onChange={(e) => {
              controller.setState({
                breakTime: getInputValue(e)
              })
            }}
            label="Break (min)"
            variant="outlined"
            value={states.breakTime}
            type="number"
          />
          <TextField
            className={classes.input}
            size="small"
            disabled={states.pomoState !== 'idle'}
            onChange={(e) => {
              controller.setState({
                warningSecs: getInputValue(e)
              })
            }}
            label="Warn (sec)"
            variant="outlined"
            value={states.warningSecs}
            type="number"
          />
        </div>

        <Button
          className={classes.mainButton}
          onClick={() => {
            if (intervalObj === null) {
              startWorkTimer()
              saveStateObj()
            }
            else {
              stopWorkTimer()
            }
          }}
        >
          {getButtonText()}
        </Button>

        <Button
          className={classes.breakButton}
          disabled={states.pomoState !== 'idle'}
          onClick={() => {
            controller.setState({
              currentTimer: 0,
            })
            if (intervalObj === null) {
              startWorkTimer()
            }
          }}
        >
          Start Break Now
        </Button>
      </div>

      <Dialog 
        open={helpOpen} 
        onClose={() => setHelpOpen(false)}
        className={classes.dialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          🍅 Pomodoro Timer Help
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <p><strong>Work (min):</strong> How long you want to focus without interruption. Usually 25-50 minutes.</p>
          <p><strong>Break (min):</strong> How long you want to rest after each work session. Usually 5-15 minutes.</p>
          <p><strong>Warn (sec):</strong> A warning sound plays this many seconds before your timer ends, so you can prepare to wrap up.</p>
          <p><strong>How it works:</strong> Start a work session → Timer counts down → Warning sound → Break time automatically starts → Repeat!</p>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setHelpOpen(false)}
            style={{ color: 'white', fontWeight: 600 }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )


}

export default index;