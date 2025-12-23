import { createBrowserRouter } from "react-router-dom";
import DishDetector from "../DishDetectior";


const router = createBrowserRouter([
{
        path:'/',

        element:<DishDetector/>
    }
    
]);

export default router;
