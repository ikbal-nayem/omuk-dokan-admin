import Icon from "@components/Icon";
import TextInput from "@components/TextInput";
import { MediaInput } from "@components/MediaInput";
import WxRadio from "@components/WxRadio/WxRadio";
import WxTextarea from "@components/WxTextarea";
import { yupResolver } from "@hookform/resolvers/yup";
import { AUDIENCES } from "routes/path-name.route";
import { MarketingService } from "services/api/marketing/Marketing.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import "./SMSAudienceForm.scss";

const audienceRadioList = [
  {
    id: 1,
    title: "Your Source",
  },
  {
    id: 2,
    title: "WebX Source(Coming Soon)",
    disable: "true",
  },
];

interface ISMSAudienceForm {
  isSaving: boolean;
  setIsSaving: Function;
}

interface IForm {
  createAudienceRadio: string;
  title: string;
  description: string;
  audienceContact: any;
}

const SMSAudienceForm = ({ isSaving, setIsSaving }: ISMSAudienceForm) => {
  const [parseLoader] = useState<boolean>(false);
  const [dataLimitExceed, setDataLimitExceed] = useState<boolean>(false);
  const [fileDetails, setFileDetails] = useState<any>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ifUpdate] = useState<boolean>(
    location.pathname.split("/").includes("update")
  );

  const [audience] = useState<any>(location.state);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IForm>({
    resolver: yupResolver(
      yup.object().shape({
        title: yup.string().required("title is required"),
        description: yup.string().required("description is required"),

        // this field will be applicable if user go to create audience
        ...(!ifUpdate && {
          audienceContact: yup
            .array()
            .required("please upload your file in csv or xls or xlsx formate")
            .nullable(),
        }),
      })
    ),
    defaultValues: {
      description: audience?.description,
      title: audience?.title,
    },
  });

  // submitting data
  const onSubmitting = (data: IForm) => {
    setIsSaving(true);
    if (ifUpdate) {
      MarketingService.audienceUpdate({
        ...audience,
        description: data.description,
        title: data.title,
      })
        .then((res) => {
          ToastService.success(res.message);
          navigate(AUDIENCES + "?type=" + searchParams.get("audience"));
        })
        .catch((err) => ToastService.error(err))
        .finally(() => setIsSaving(false));
      return;
    }

    const requireOBJ = {
      audience: {
        title: data.title,
        description: data.description,
      },
      ...data,
    };

    MarketingService.createSMSAudience(requireOBJ)
      .then((res) => {
        ToastService.success(res.message);
        navigate(AUDIENCES + "?type=" + searchParams.get("audience"));
      })
      .catch((err) => ToastService.error(err))
      .finally(() => setIsSaving(false));
  };

  // parsing csv, xls or xlsx file
  const fileParser = useCallback((file: any) => {
    setDataLimitExceed(file.dataLimitExceed);
    if (!file.dataLimitExceed) {
      setFileDetails(file.details);
      setValue("audienceContact", file.data);
    }
  }, []);

  return (
    <>
      <form
        id="smsAudienceForm"
        className="mt-3"
        onSubmit={handleSubmit(onSubmitting)}
        noValidate
      >
        {isSaving ? <Preloader /> : null}
        <div className="row ">
          <div className="col-md-12 col-lg-12 col-sm-12">
            <div className="card p-4 mb-3">
              <div className="row">
                <div className="col-md-12 col-lg-12">
                  <h6 className="text_h6 text_semibold">
                    Create Audience
                  </h6>
                  <WxRadio
                    id="typeRadio3"
                    name="createAudienceRadio"
                    returnValue="title"
                    radioStyle="row"
                    options={audienceRadioList}
                    textKey="title"
                    registerProperty={{
                      ...register("createAudienceRadio"),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="card p-4 mb-3">
              <div className="row">
                <h6 className="text_h6 text_semibold">Upload File</h6>
                {!ifUpdate ? (
                  !Object.keys(fileDetails).length ? (
                    <>
                      <div className="col-md-12 col-lg-12">
                        <MediaInput
                          dragNDropFor="csv"
                          dragNDropText="file"
                          accept=".xlsx,.xls,.csv"
                          fileList={[]}
                          onChange={(file) => fileParser(file)}
                        />
                        {!watch("audienceContact") ? (
                          <span className="note_text text-danger text_body">
                            {errors?.audienceContact?.message as string}
                          </span>
                        ) : null}
                      </div>
                      <div className="col-md-12 col-lg-12">
                        {parseLoader ? <Preloader /> : null}
                      </div>
                      {dataLimitExceed && (
                        <div className="col-md-12 col-lg-12 mt-3 ">
                          <div className="d-flex align-items-center rounded wx__warn_alert">
                            <Icon icon="info" />
                            <div>
                              <p className="mb-0 text_body d-block">
                                You exceed file size limit. Please upload less
                                than 1MB file
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="col-md-12 col-lg-12 mt-3 ">
                        <div className="d-flex align-items-center rounded wx__demo_file">
                          <Icon icon="file_download" />
                          <div>
                            <div className="w-100 d-flex align-items-center justify-content-between">
                              <a href="#" className="text_body">
                                Download file type
                              </a>
                              <div className="d-flex align-items-center text_small text-secondary">
                                <Icon
                                  style={{ fontSize: "8px" }}
                                  icon="info"
                                  className="ms_2"
                                />
                                <span className="">
                                  if you upload any invalid number then it will
                                  be deleted automatically
                                </span>
                              </div>
                            </div>
                            <p className="mb-0 text_small d-block">
                              Download this for creating your actually file
                              properly
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-md-12 col-lg-12 mt-3 ">
                      <div className="d-flex align-items-center rounded wx__file_present">
                        <Icon className="text-success" icon="task" />
                        <div>
                          {fileDetails.fileName && (
                            <p className="mb-0 text_body d-block">
                              {fileDetails.fileName}
                            </p>
                          )}
                          {fileDetails.fileExtension && (
                            <p className="mb-0 text_body d-block">
                              <span className="text_semibold">
                                File type :{" "}
                              </span>
                              {fileDetails.fileExtension}
                            </p>
                          )}
                          {fileDetails.fileSize && (
                            <p className="mb-0 text_body d-block">
                              <span className="text_semibold">
                                File Size :{" "}
                              </span>
                              {fileDetails.fileSize.toFixed(2)} {" MB"}
                            </p>
                          )}
                          {fileDetails.fileDataLength && (
                            <p className="mb-0 text_body d-block">
                              <span className="text_semibold">
                                Total Data found :{" "}
                              </span>
                              {fileDetails.fileDataLength}
                            </p>
                          )}
                        </div>
                        <Icon
                          className="text-danger ms-auto"
                          icon="close"
                          onClick={() => {
                            setFileDetails({});
                            setValue("audienceContact", null);
                          }}
                        />
                      </div>
                    </div>
                  )
                ) : null}
                <div className="col-md-12 col-lg-12 mt-2">
                  <TextInput
                    label="Audience Title"
                    isRequired
                    placeholder="Enter audience title here"
                    registerProperty={{
                      ...register("title", {
                        required: true,
                      }),
                    }}
                    color={errors?.title ? "danger" : "secondary"}
                    errorMessage={errors?.title?.message}
                  />
                </div>
                <div className="col-md-12 col-lg-12">
                  <WxTextarea
                    label="Description"
                    isRequired
                    helpText="0/250"
                    registerProperty={{
                      ...register("description", {
                        required: true,
                      }),
                    }}
                    color={errors?.description ? "danger" : "secondary"}
                    errorMessage={errors?.description?.message}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SMSAudienceForm;
