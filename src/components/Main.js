import React from "react";
import { Link } from "react-router-dom";

const Main = ()=>{
return(
    <div> 
        <Link to="inicio">ingresar datos manualmente  </Link> <br/>
        <Link to="uploadfile">importar datos de excel</Link> <br/>
    </div>
)
}
export default Main;