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

const index: React.FC<Props> = (props) => {
  // Hooks
  const states = useSelector(() => controller.states);
  const classes = useStyles();

  useEffect(() => {
    controller.setState({
      currentTimer: states.workTime * 60
    })
  }, [])

  // Funcs
  const getInputValue = (e) => {
    if (e.target.value == '') {
      e.target.value = '0'
    }
    var value = value = parseInt(e.target.value)
    if (value < 1) {
      value = 1
    }
    return value
  }

  // Vars

  // JSX

  return (
    <Grid container direction='column' justifyContent='center' alignContent='center' alignItems='center' style={{ padding: 16 }}>
      <Typography style={{ fontSize: 16 }} variant='h6'>Pomota</Typography>
      <Typography variant='h6'>{new Date(states.currentTimer * 1000).toISOString().substring(14, 19)}</Typography>
      <TextField onChange={(e) => {
        controller.setState({
          workTime: getInputValue(e),
          currentTimer: getInputValue(e) * 60,
        })
      }} style={{ ...style, marginTop: 16 }} label='Work time ( minutes )' variant='outlined' value={states.workTime} type='number' />
      <TextField onChange={(e) => {
        controller.setState({
          breakTime: getInputValue(e)
        })
      }} style={style} label='Break time ( minutes )' variant='outlined' value={states.breakTime} type='number' />
      <Button style={style} variant='outlined'
        onClick={() => {
          controller.setState({
            pomoState: 'work'
          })
        }}
      >Start</Button>
    </Grid>
  )

}

export default index;