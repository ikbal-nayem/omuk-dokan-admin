import WxButton from "@components/WxButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IThemeInstalled } from "@interfaces/themeCustomization.interface";
import "./livetheme.scss";
import WxNotFound from "@components/NotFound/WxNotFound";
import { imageURLGenerate } from "utils/utils";
import { THEME_CUSTOMIZATION_SLIDER } from "routes/path-name.route";

type ILiveThemeProps = {
	installedThemes: IThemeInstalled[];
};

const LiveTheme = ({ installedThemes }: ILiveThemeProps) => {
	const [showPopup, setShowPopup] = useState<boolean>(false);
	const navigate = useNavigate();

	const onShowPopup = () => {
		setShowPopup(!showPopup);
	};

	const activeTheme = installedThemes.find((theme) => theme.isActive);

	if (!activeTheme)
		return <WxNotFound title="Oops!" description="No published theme found!" />;

	return (
		<div className="live-theme wx__row">
			<div className="wx__col-md-12 wx__col-sm-12">
				<h5 className="wx__text_semibold">
					Live Theme <i>({activeTheme?.themeRegisterDTO?.title})</i>
				</h5>
				<p className="wx__text_body wx__text_regular">
					{activeTheme?.themeRegisterDTO?.shortDesc}
				</p>
			</div>
			<div className="livetheme-pad wx__col-lg-8 wx__col-md-7 wx__col-sm-12 wx__mt-3">
				<img
					src={imageURLGenerate(
						activeTheme?.themeRegisterDTO?.screenshots?.[0]
					)}
				/>
			</div>
			<div className="livetheme-pad wx__col-lg-4 wx__col-md-5 wx__col-sm-12 wx__mt-3">
				<h5 className="wx__text_semibold wx__mb-0">
					{activeTheme?.themeRegisterDTO?.title}
				</h5>
				<p className="version">
					Total review :{" "}
					<span className="wx__body_medium">
						{activeTheme?.themeRegisterDTO?.totalReview}
					</span>
				</p>
				<p className="wx__text_regular wx__mb-1">
					Avarage rating : {activeTheme?.themeRegisterDTO?.avgRating} / 5
				</p>
				{/* <p className="wx__text_regular wx__mb-4">
					Layout : <span className="wx__body_medium">{layout}</span>
				</p> */}
				<div className="wx__d-flex wx__align-items-center">
					<WxButton
						className="wx__me-2"
						variant="fill"
						onClick={() => {
							navigate(THEME_CUSTOMIZATION_SLIDER);
						}}
					>
						Customize
					</WxButton>
					{/* <WxButton variant="none" onClick={() => onShowPopup()}>
            More
            <WxIcon
              icon="more_vert"
              id="triggerId"
              className="text-primary wx__ms-3"
            />
            <WxDropdown
              isOpen={showPopup}
              setIsOpen={setShowPopup}
              className="live-theme-drawer"
            >
              <ul>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="visibility" />
                    View
                  </Link>
                </li>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="title" />
                    Rename
                  </Link>
                </li>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="language" />
                    Duplicate Site
                  </Link>
                </li>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="download" />
                    Download Theme
                  </Link>
                </li>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="code" />
                    Edit Code
                  </Link>
                </li>
                <li className="wx__text_subtitle">
                  <Link to="" className="wx__text_body">
                    <WxIcon icon="translate" />
                    Edit Language
                  </Link>
                </li>
              </ul>
            </WxDropdown>
          </WxButton> */}
				</div>
			</div>
		</div>
	);
};

export default LiveTheme;
