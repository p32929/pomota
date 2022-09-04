import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Button, Grid, TextField, Typography } from "@material-ui/core";
import { useSelector } from 'react-redux';
import { controller } from '../utils/StatesController';

interface Props {

}

const useStyles = makeStyles((theme) => ({
  // Define your styles here
}));

const style = { width: '100%', marginTop: 12 }
var intervalObj = null

const index: React.FC<Props> = (props) => {
  // Hooks
  const states = useSelector(() => controller.states);
  const classes = useStyles();

  useEffect(() => {
    controller.setState({
      // currentTimer: states.workTime * 60
      currentTimer: 3
    })
  }, [])

  // Funcs
  const getInputValue = (e) => {
    if (e.target.value == '') {
      e.target.value = '0'
    };
    var value = value = parseInt(e.target.value)
    if (value < 1) {
      value = 1
    }
    return value
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
    var timerNow = controller.states.currentTimer;

    intervalObj = setInterval(() => {
      timerNow--

      if (timerNow < 0) {
        if (controller.states.pomoState == 'work') {
          console.log(`1`)
          timerNow = 5

          controller.setState({
            currentTimer: timerNow,
            pomoState: 'break'
          })
        }
        else if (controller.states.pomoState == 'break') {
          console.log(`2`)
          stopWorkTimer()
        }
      }
      else {
        controller.setState({
          currentTimer: timerNow
        })
        console.log(`RUNNING`)
        intervalObj = null
      }

    }, 1000)
  }

  const stopWorkTimer = () => {
    console.log("STOP")
    clearInterval(intervalObj)
    intervalObj = null
    controller.setState({
      pomoState: 'idle',
      currentTimer: 12
    })
  }

  // Vars

  // JSX

  return (
    <Grid container direction='column' justifyContent='center' alignContent='center' alignItems='center' style={{ padding: 16 }}>
      <Typography style={{ fontSize: 16, fontWeight: 700 }} variant='h6'>{states.pomoState.toUpperCase()}</Typography>
      <Typography style={{ fontSize: 24 }} variant='h6'>...::: {new Date(states.currentTimer * 1000).toISOString().substring(14, 19)} :::...</Typography>
      <TextField disabled={states.pomoState !== 'idle'} onChange={(e) => {
        controller.setState({
          workTime: getInputValue(e),
          currentTimer: getInputValue(e) * 60,
        })
      }} style={{ ...style, marginTop: 16 }} label='Work time ( minutes )' variant='outlined' value={states.workTime} type='number' />
      <TextField disabled={states.pomoState !== 'idle'} onChange={(e) => {
        controller.setState({
          breakTime: getInputValue(e)
        })
      }} style={style} label='Break time ( minutes )' variant='outlined' value={states.breakTime} type='number' />
      <Button style={style} variant='outlined'
        onClick={() => {
          if (intervalObj == null) {
            startWorkTimer()
          }
          else {
            stopWorkTimer()
          }

        }}
      >{getButtonText()}</Button>
    </Grid>
  )

}

export default index;