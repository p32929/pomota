import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Button, Grid, TextField, Toolbar, Typography } from "@material-ui/core";
import { useSelector } from 'react-redux';
import { controller, initialState, IStates } from '../utils/StatesController';
import { WebviewWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import * as wt from 'worker-timers';

interface Props {

}

const useStyles = makeStyles((theme) => ({
  // Define your styles here
}));

const STORED_STATE = "STORED_STATE"
const style = { width: '100%', marginTop: 12 }
var intervalObj = null
var appWindow: WebviewWindow = null

const index: React.FC<Props> = (props) => {
  // Hooks
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

  const getInputValue = (e) => {
    if (e.target.value == '') {
      e.target.value = '0'
    };
    var value = value = parseInt(e.target.value)
    // if (value < 1) {
    //   value = 1
    // }
    // console.log(`Value: ${value}`)
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
      return "START"
    }
    else {
      return "STOP"
    }
  }

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
    <Grid container direction='column' justifyContent='center' alignContent='center' alignItems='center'>
      <AppBar elevation={8} position='static'>
        <Toolbar>
          <Typography variant='h6' style={{ flexGrow: 1, fontWeight: 100, fontFamily: 'cursive' }}>
            💻 {states.pomoState.toUpperCase()}
          </Typography>

          <Typography variant='h6' style={{ fontWeight: 100, fontFamily: 'cursive' }}>
            ⏲️ {new Date(states.currentTimer * 1000).toISOString().substring(14, 19)}
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container direction='column' justifyContent='center' alignContent='center' alignItems='center' style={{ padding: 16 }}>
        <TextField color='secondary' size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
          controller.setState({
            workTime: getInputValue(e),
            currentTimer: getInputValue(e) * 60,
          })
        }} style={{ ...style, marginTop: 16 }} label='Work time ( minutes )' variant='outlined' value={states.workTime} type='number' />
        <TextField color='secondary' size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
          controller.setState({
            breakTime: getInputValue(e)
          })
        }} style={style} label='Break time ( minutes )' variant='outlined' value={states.breakTime} type='number' />
        <TextField color='secondary' size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
          controller.setState({
            warningSecs: getInputValue(e)
          })
        }} style={style} label='Play warning sound be/for ( seconds )' variant='outlined' value={states.warningSecs} type='number' />
        <Button color='secondary' size='small' style={style} variant='outlined'
          onClick={() => {
            if (intervalObj === null) {
              startWorkTimer()
              saveStateObj()
            }
            else {
              stopWorkTimer()
            }
          }}
        >{getButtonText()}</Button>

        <Button color='secondary' disabled={states.pomoState !== 'idle'} size='small' style={style} variant='outlined'
          onClick={() => {
            controller.setState({
              currentTimer: 0,
            })
            if (intervalObj === null) {
              startWorkTimer()
            }
          }}
        >BREAK</Button>
      </Grid>

    </Grid >
  )

  // Ui V1
  // return (
  //   <Grid container direction='column' justifyContent='center' alignContent='center' alignItems='center' style={{ padding: 16 }}>
  //     <Typography style={{ fontSize: 16 }} variant='h6'>{states.pomoState.toUpperCase()}</Typography>
  //     <Typography style={{ fontSize: 24 }} variant='h6'>...::: {new Date(states.currentTimer * 1000).toISOString().substring(14, 19)} :::...</Typography>
  //     <TextField size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
  //       controller.setState({
  //         workTime: getInputValue(e),
  //         currentTimer: getInputValue(e) * 60,
  //       })
  //     }} style={{ ...style, marginTop: 16 }} label='Work time ( minutes )' variant='outlined' value={states.workTime} type='number' />
  //     <TextField size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
  //       controller.setState({
  //         breakTime: getInputValue(e)
  //       })
  //     }} style={style} label='Break time ( minutes )' variant='outlined' value={states.breakTime} type='number' />
  //     <TextField size='small' disabled={states.pomoState !== 'idle'} onChange={(e) => {
  //       controller.setState({
  //         warningSecs: getInputValue(e)
  //       })
  //     }} style={style} label='Play warning sound be/for ( seconds )' variant='outlined' value={states.warningSecs} type='number' />
  //     <Button size='small' style={style} variant='outlined'
  //       onClick={() => {
  //         if (intervalObj == null) {
  //           startWorkTimer()
  //           saveStateObj()
  //         }
  //         else {
  //           stopWorkTimer()
  //         }
  //       }}
  //     >{getButtonText()}</Button>

  //     <Button disabled={states.pomoState === 'break'} size='small' style={style} variant='outlined'
  //       onClick={() => {
  //         controller.setState({
  //           currentTimer: 0,
  //         })
  //         if (intervalObj == null) {
  //           startWorkTimer()
  //         }
  //       }}
  //     >BREAK</Button>

  //   </Grid>
  // )

}

export default index;