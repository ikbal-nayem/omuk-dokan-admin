import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const position = "bottom-right"
const time = 2000
type Status = 'success' | 'fail' | 'warning'
interface INotification{
    status?: Status;
    data: string;
}


export function notification({status,data}:INotification){
    
    let msg = null
    switch(status){
        case 'success':
            msg = toast.success(data, {
                position: position,
                autoClose: time,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break
        case 'fail':
            msg = toast.error(data, {
                position: position,
                autoClose: time,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break
        case 'warning':
            msg = toast.warning(data, {
                position: position,
                autoClose: time,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break
        default:
            msg = toast.info(data, {
                position: position,
                autoClose: time,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
    }
    return msg
}

