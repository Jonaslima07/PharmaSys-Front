import React from 'react'
import './Header.css'; 


const Header = () => {
  return (
    <header className='header'>
           
                <h1 className='h1'>PharmaSys</h1>
        
            <nav>
            <a href="">Home</a>
                <a href ="">Cadastro de Pacientes</a>
                <a href ="">Cadastro de lotes</a>
                <a href ="">Dispensação de mendicamentos</a>
            </nav>
        </header>
  )
}

export default Header
