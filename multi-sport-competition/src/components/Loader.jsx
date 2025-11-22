import React from 'react'
import './Loader.css'
import { 
  IoFootball, 
  IoBasketball, 
  IoTennisball, 
  IoBicycle 
} from 'react-icons/io5'
import { 
  FaRunning, 
  FaSwimmer 
} from 'react-icons/fa'

const sportsIcons = [
  <IoFootball />,
  <IoBasketball />,
  <IoTennisball />,
  <FaSwimmer />,
  <FaRunning />,
  <IoBicycle />
]

/**
 * Composant Loader Sportif
 * Affiche un carrousel rotatif d'icônes de sport
 */
const Loader = ({ text = null }) => {
  return (
    <div className="loader-wrapper">
      <div className="sport-loader-container">
        <div className="sport-orbit">
          {sportsIcons.map((icon, index) => (
            <div 
              key={index} 
              className="sport-ball" 
              style={{ '--i': index, '--total': sportsIcons.length }}
            >
              {icon}
            </div>
          ))}
        </div>
        <div className="sport-center-logo">
          
        </div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}

export default Loader
