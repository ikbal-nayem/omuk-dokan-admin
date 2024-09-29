type DrawerBodyProps = {
	children: JSX.Element | JSX.Element[] | string;
};

const WxDrawerBody = ({ children }: DrawerBodyProps) => {
	return <div className="wx__side_drawer__body">{children}</div>;
};

export default WxDrawerBody;
