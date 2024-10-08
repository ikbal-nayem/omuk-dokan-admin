import React from "react";
import './MainContentLayout.scss'

interface IWxMainMd {
    className?:string;
    children: JSX.Element | JSX.Element[] | any;
}

const WxMainMd = ({className,children}:IWxMainMd) => {

    return(
        <section className={`w-100 d-flex justify-content-center wx__main_md ${className || ''}`}>
            <div className="w-100 wx__main_content setting_content">{children}</div>
        </section>
    )
}

export default WxMainMd