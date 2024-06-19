import React from "react";
import { Link } from "react-router-dom";

const Inicio = ()=>{
return(
    <div> 
        <Link to="/vertical">vertical </Link> <br/>
        <Link to="/horizontal">horizontal</Link> <br/>
        <Link to="/horizontalbase">horizontal base</Link>
        <br/>
        <button>
            <Link to="/">atras</Link>
        </button>
    </div>
)
}
export default Inicio;