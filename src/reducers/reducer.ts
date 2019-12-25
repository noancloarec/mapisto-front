import {UPDATE_TIME  } from "../constants/constants";
interface State{
  current_date : Date
}
const initialState : State = {
  current_date: new Date('1918-01-01')
};
function rootReducer(state = initialState, action:any) : State {
  if (action.type === UPDATE_TIME) {
    return {
      current_date : action.payload
    }
  }
  return state;
}
export default rootReducer;
