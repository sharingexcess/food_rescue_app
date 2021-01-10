import { useDispatch, useSelector } from 'react-redux'
import { setDarkMode } from '../../redux/app/appReducer'
import './ModeToggle.scss'

export default function ModeToggle() {
  const dispatch = useDispatch()
  const darkMode = useSelector(store => store.app.darkMode)

  return (
    <div id="ModeToggle" className={darkMode ? 'dark' : 'light'}>
      <div id="ToggleHandle" onClick={() => dispatch(setDarkMode(!darkMode))}>
        <i className={darkMode ? 'fa fa-moon' : 'fa fa-sun'} />
      </div>
    </div>
  )
}
