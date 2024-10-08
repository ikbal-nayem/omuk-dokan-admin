import WxMainXl from "@components/MainContentLayout/WxMainXl";
import {Button} from "@components/Button";
import { IAppDetails, IInstalledApp } from "@interfaces/app.interface";
import { APPS_LIST } from "routes/path-name.route";
import { AppsService } from "services/api/Apps.service";
import Preloader from "services/utils/preloader.service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Apps.scss";
import InstallApp from "./components/InstallApps/InstallApps";
import SuggestedApp from "./components/SuggestedApps/Suggested";

const Apps = () => {
	const navigate = useNavigate();
	const [isInstalledLoading, setInstalledLoading] = useState<boolean>(true);
	const [isSuggestedLoading, setSuggestedLoading] = useState<boolean>(true);
	const [suggestedAppData, setSuggestedAppData] = useState<IAppDetails[]>();
	const [installedApp, setInstalledApp] = useState<IInstalledApp[]>();

	const { activePlan } = useSelector((data: any) => data.user);

	useEffect(() => {
		getInstalled();
		getSuggested();
	}, []);

	const getInstalled = () => {
		setInstalledLoading(true);
		AppsService.getInstalledApp()
			.then((res) => setInstalledApp(res.body))
			.finally(() => setInstalledLoading(false));
	};

	const getSuggested = () => {
		setSuggestedLoading(true);
		AppsService.get({
			body: { packageLevel: activePlan?.level },
			meta: {
				offset: 0,
				limit: 6,
			},
		})
			.then((res) => setSuggestedAppData(res?.body))
			.finally(() => setSuggestedLoading(false));
	};

	return (
		<WxMainXl className="wx__apps-page">
			<div className="d-flex justify-content-between align-items-center">
				<h4 className="text_heading  mb-0">Apps</h4>
				<Button variant="fill">Visit Store</Button>
			</div>

			<div className="card p-4 mt-3 wx__install-app">
				<h6 className="text_body text_medium wx__subtitle-1 mb-2">
					Installed Apps
				</h6>
				{isInstalledLoading ? (
					<Preloader />
				) : installedApp?.length ? (
					<InstallApp installAppsData={installedApp} />
				) : (
					<h6 className="text-center text-muted">
						No installed app found
					</h6>
				)}
			</div>

			<div className="card p-4 mt-3 wx__suggested_app">
				<div className="d-flex justify-content-between align-items-center">
					<h6 className="text_body text_medium mb-2 wx__subtitle-1">
						Recommended For You
					</h6>
					<Button
						variant="fill"
						size="sm"
						className="rounded"
						onClick={() => navigate(APPS_LIST)}
					>
						Get More Apps
					</Button>
				</div>

				<div className="wx__suggested_product">
					{isSuggestedLoading ? (
						<Preloader />
					) : suggestedAppData?.length ? (
						<SuggestedApp
							appListData={suggestedAppData}
							installedApps={installedApp}
						/>
					) : (
						<h6 className="text-center text-muted">Nothing to show</h6>
					)}
				</div>
			</div>
		</WxMainXl>
	);
};

export default Apps;
