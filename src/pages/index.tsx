import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from "@material-ui/core";
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
    gap: '20px',
    width: '100%',
    maxWidth: '280px'
  },
  timer: {
    fontSize: '48px',
    fontWeight: 600,
    color: 'white',
    fontFamily: '"SF Mono", monospace',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
    textAlign: 'center'
  },
  inputs: {
    display: 'flex',
    gap: '8px',
    width: '100%'
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
      '&.Mui-disabled': {
        color: 'rgba(255, 255, 255, 0.3)',
      }
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
      <div className={classes.container}>
        <div className={classes.timer}>
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
    </div>
  )


}

export default index;