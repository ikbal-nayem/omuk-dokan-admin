import WxMainXl from "@components/MainContentLayout/WxMainXl";
import WxAccordion from "@components/WxAccordion";
import WxButton from "@components/WxButton";
import { WxFormHeader } from "@components/WxFormLayout";
import WxIcon from "@components/WxIcon/WxIcon";
import WxTabs from "@components/WxTabs/WxTabs";
import WxTag from "@components/WxTag";
import WxThumbnail from "@components/WxThumbnail/WxThumbnail";
import {
  ITheme,
  IThemeRelease,
} from "@interfaces/themeCustomization.interface";
import NotFound from "@pages/errors/PageNotFound";
import {
	SETTINGS_PRICING_PLAN,
	THEMES_LIST,
	THEMES_OVERVIEW,
	THEMES_REVIEW,
	THEMES_SUPPORT,
} from "routes/path-name.route";
import { ThemeService } from "services/api/onlineStore/themes/Theme.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import starIcon from "assets/images/apps_img/star.png";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { generateDateFormat } from "utils/splitDate";
import { imageURLGenerate } from "utils/utils";
import ThemeList from "../allview/ThemeList";
import TabOverview from "./components/Overview/Overview";
import TabReview from "./components/Review/Review";
import "./ThemeDetails.scss";

const tabsData = [
  { id: 1, label: "Overview" },
  { id: 2, label: "Review" },
  { id: 3, label: "FAQ" },
];

const ThemesDetails = () => {
  const [themeDetails, setThemeData] = useState<ITheme>();
  const [themeReleaseInfo, setReleaseInfo] = useState<IThemeRelease>();
  const [themeList, setThemeList] = useState<ITheme[]>();
  const [themeFAQ, setThemeFAQ] = useState<[]>([]);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [installStatus, setInstallStatus] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { activePlan } = useSelector((data: any) => data.user);

  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();

  useEffect(() => {
    setIsLoading(true);
    const themeDetailsReq = ThemeService.getById(id);
    const themeReleaseReq = ThemeService.getReleaseData(id);
    const themeCheckInstalledReq = ThemeService.checkIsInstalled(id);
    const themeFAQReq = ThemeService.getFAQ({
      body: { themeId: id },
    });
    const themeListReq = ThemeService.getList({
      body: { limit: 6, offset: 0 },
    });
    Promise.allSettled([
      themeDetailsReq,
      themeReleaseReq,
      themeCheckInstalledReq,
      themeListReq,
      themeFAQReq,
    ])
      .then(
        ([
          themeDetailsRes,
          themeReleaseRes,
          themeCheckInstalledRes,
          themeListRes,
          themeFAQRes,
        ]) => {
          themeDetailsRes.status === "fulfilled" &&
            setThemeData(themeDetailsRes.value?.body);
          themeReleaseRes.status === "fulfilled" &&
            setReleaseInfo(themeReleaseRes.value?.body);
          themeCheckInstalledRes.status === "fulfilled" &&
            setInstallStatus(themeCheckInstalledRes.value?.body);
          themeListRes.status === "fulfilled" &&
            setThemeList(themeListRes.value?.body);
          themeFAQRes.status === "fulfilled" &&
            setThemeFAQ(themeFAQRes.value?.body);
        }
      )
      .catch((err) => ToastService.error(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const routeList = [
    THEMES_OVERVIEW({ theme_id: id }),
    THEMES_REVIEW({ theme_id: id }),
    THEMES_SUPPORT({ theme_id: id }),
  ];

  const [activeTab, setActiveTab] = useState<number>(
		routeList.indexOf(location?.pathname)
	);

  useEffect(() => {
		setActiveTab(routeList.indexOf(location?.pathname));
	}, [location?.pathname]);

  useEffect(() => {
    navigate(routeList[activeTab]);
  }, [activeTab]);

  const onInstallOrUninstall = () => {
    setIsInstalling(true);
    const req = !installStatus?.isInstalled
      ? ThemeService.themeInstall
      : ThemeService.themeUninstall;
    req({ body: { themeId: id } })
      .then((resp) => {
        ToastService.success(resp.message);
        setInstallStatus(resp?.body);
      })
      .catch((err) => {
        installStatus?.isInstalled
          ? ToastService.warning(err.message)
          : ToastService.error(err.message);
      })
      .finally(() => setIsInstalling(false));
  };

  const onPublish = () => {
    setIsPublishing(true);
    ThemeService.themePublish({ themeId: id })
      .then((resp) => {
        ToastService.success(resp.message);
        setInstallStatus(resp.body);
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setIsPublishing(false));
  };

  return (
    <WxMainXl className="wx__theme_details_page">
      <WxFormHeader title="Theme Details" backNavigationLink={THEMES_LIST} />
      <div className="wx__card wx__mt-3 wx__p-3 wx__details_top">
        {isLoading ? (
          <Preloader />
        ) : (
          <div className="wx__row  wx__pb-0">
            <div className="wx__col-lg-5 wx__col-md-6 wx__col-sm-12 wx__details_top_left wx__d-flex wx__align-items-center">
              <div>
                <WxThumbnail
                  src={imageURLGenerate(themeDetails?.themeIcon)}
                  noBorder
                />
                <h2 className="wx__mb-2 wx__mt-3">{themeDetails?.title}</h2>
                <p className="wx__tag_line">{themeDetails?.shortDesc}</p>
                <p className="wx__user_review h6 wx__pt-3 wx__pb-3">
                  <img className="wx__icon_star" src={starIcon} alt="icon" />
                  {themeDetails?.avgRating}/5 &nbsp;
                  <span>({themeDetails?.totalReview} Review)</span>
                </p>
                <div className="wx__d-flex wx__align-items-center wx__gap-3">
                  <WxButton
                    variant={installStatus?.isInstalled ? "outline" : "fill"}
                    color={installStatus?.isInstalled ? "secondary" : "primary"}
                    onClick={onInstallOrUninstall}
                    disabled={
                      isInstalling ||
                      activePlan?.level < themeDetails?.packageLevel
                    }
                  >
                    {isInstalling ? (
                      <Preloader />
                    ) : installStatus?.isInstalled ? (
                      "Uninstall"
                    ) : (
                      "Install"
                    )}
                  </WxButton>
                  {installStatus?.isInstalled &&
                    (installStatus?.isPublished ? (
                      <WxTag label="Published" color="success" />
                    ) : (
                      <WxButton
                        variant="fill"
                        color="primary"
                        className="wx__p-2"
                        onClick={onPublish}
                        disabled={
                          activePlan?.level < themeDetails?.packageLevel
                        }
                      >
                        {isPublishing ? <Preloader /> : "Publish"}
                      </WxButton>
                    ))}
                </div>
                {activePlan?.level < themeDetails?.packageLevel && (
                  <small>
                    <Link
                      to={SETTINGS_PRICING_PLAN}
                      className="wx__text-decoration-none wx__text-warning wx__d-flex wx__align-items-center wx__gap-1 wx__mt-2"
                    >
                      <WxIcon
                        icon="info"
                        variants="outlined"
                        color="warning"
                        size={15}
                      />
                      Please upgrade your plan to install the theme.
                    </Link>
                  </small>
                )}
              </div>
            </div>
            <div className="wx__col-lg-7 wx__col-md-6 wx__col-sm-12 wx__details_top_right wx__d-flex wx__justify-content-center wx__mt-md-0 wx__mt-3">
              <div className="video_sec">
                <iframe
                  src={themeDetails?.videoLink}
                  title={themeDetails?.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="wx__row wx__details_mid">
        <div className="wx__col-lg-8 wx__col-md-7 wx__col-sm-12 wx__mt-3 ">
          <div className="wx__card wx__details_mid_left wx__p-4">
            <WxTabs
              option={tabsData}
              labelKey="label"
              currentIndex={activeTab}
              setCurrentIndex={setActiveTab}
            />
            <div className="wx__pt-4">
              <Routes>
                <Route
                  path="/overview"
                  element={
                    <TabOverview
                      description={themeDetails?.longDesc}
                      screenshot={themeDetails?.screenshots}
                    />
                  }
                />
                <Route path="/review" element={<TabReview />} />
                <Route
                  path="/support"
                  element={
                    <div className="wx__fqa">
                      {themeFAQ?.length ? (
                        <>
                          <h5 className="wx__text_semibold mb-3">FQA</h5>
                          <WxAccordion
                            data={themeFAQ}
                            labelKey="faqQuestion"
                            descriptionKey="faqAnswer"
                          />
                        </>
                      ) : (
                        <h6 className="wx__text-muted wx__text_italic wx__text-center">
                          No FAQ found!
                        </h6>
                      )}
                    </div>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </div>
        <div className="wx__col-lg-4 wx__col-md-5 wx__col-sm-12">
          <div className="wx__card wx__details_mid_right wx__mt-3 wx__p-3">
            <h5>Info</h5>
            {isLoading ? <Preloader /> : null}
            {themeReleaseInfo ? (
              <ul>
                <li className="d-flex justify-content-between align-items-center">
                  <p className="info_label ">Version</p>
                  <p className="info_value ">{themeReleaseInfo?.lastVersion}</p>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <p className="info_label ">First Upload</p>
                  <p className="info_value ">
                    {generateDateFormat(
                      themeReleaseInfo?.fileUploadDate,
                      "%MM% %date%, %yyyy%"
                    )}
                  </p>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <p className="info_label ">Last Upload</p>
                  <p className="info_value ">
                    {themeReleaseInfo?.lastUploadDate &&
                      generateDateFormat(
                        themeReleaseInfo?.lastUploadDate,
                        "%MM% %date%, %yyyy%"
                      )}
                  </p>
                </li>
                <li className="wx__d-flex wx__justify-content-between wx__align-items-center">
                  <p className="info_label ">Total User</p>
                  <p className="info_value ">{themeReleaseInfo?.totalUsers}</p>
                </li>
                <li className="wx__d-flex wx__justify-content-between wx__align-items-center">
                  <p className="info_label ">Total Install</p>
                  <p className="info_value ">
                    {themeReleaseInfo?.totalInstalledUser || 0}
                  </p>
                </li>
                <li className="wx__d-flex wx__justify-content-between">
                  <p className="info_label ">Tags</p>
                  <div className="info_value wx__d-flex wx__flex-wrap wx__justify-content-end wx__gap-1">
                    {themeReleaseInfo?.tags?.split(",")?.map((tag: string) => (
                      <div key={tag}>
                        <WxTag label={tag} className="wx__m-0" />
                      </div>
                    ))}
                  </div>
                </li>
              </ul>
            ) : null}
          </div>
          <div className="wx__card wx__details_mid_right wx__p-3 wx__mt-3">
            <h5>Support</h5>
            <div className="wx__d-flex wx__align-items-center wx__mb-2">
              <WxIcon icon="apartment" variants="filled" />
              &nbsp;
              <span>{themeReleaseInfo?.developer?.companyName}</span>
            </div>
            <a
              href={"tel:" + themeReleaseInfo?.developer?.supportPhone}
              className="phone wx__d-flex wx__align-items-center"
            >
              <WxIcon icon="phone" variants="filled" />
              &nbsp;
              <span>{themeReleaseInfo?.developer?.supportPhone}</span>
            </a>
            <a
              href="https://webx.xyz/privacy-policy/"
              target="_blank"
              className="privacy_policy wx__d-flex wx__align-items-center"
            >
              <WxIcon icon="privacy_tip" variants="filled" />
              &nbsp;
              <span>Privacy Policy</span>
            </a>
            <a
              href={"mailto:" + themeReleaseInfo?.developer?.supportEmail}
              className="mail wx__d-flex wx__align-items-center"
            >
              <WxIcon
                icon="markunread"
                variants="filled"
                className="email__icon"
              />
              &nbsp;
              <span>{themeReleaseInfo?.developer?.supportEmail}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="wx__similar_themes wx__mt-3 wx__p-3 wx__card">
        <h5 className="wx__text_semibold wx__mb-2">Similar Themes</h5>
        <div className="wx__pt-3">
          <ThemeList themeList={themeList} />
        </div>
      </div>
    </WxMainXl>
  );
};

export default ThemesDetails;
