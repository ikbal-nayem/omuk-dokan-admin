import { ConfirmationModal } from "@components/ConfirmationModal/ConfirmationModal";
import MainFull from "@components/MainContentLayout/MainFull";
import WxNotFound from "@components/NotFound/NotFound";
import {Button} from "@components/Button";
import { FormHeader } from "@components/FormLayout";
import Pagination from "@components/Pagination";
import { IPagesSettings } from "@interfaces/Settings.interface";
import { PAGES_CREATE } from "routes/path-name.route";
import { PagesSettingService } from "services/api/settings/Pages.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setGlobCustomerList } from "store/reducers/utileReducer";
import { dispatch } from "store/store";
import PageTable from "./components/PageTable";

const Pages = () => {
  const [pages, setPages] = useState<IPagesSettings[]>([]);

  const [pageMeta, setPageMeta] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // pagination states
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page"))
  );
  const [paginationLimit, setPaginationLimit] = useState(10);

  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const deleteItem = useRef<IPagesSettings | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getPageList();
  }, [paginationLimit, currentPage]);

  const getPageList = () => {
    setIsLoading(true);
    PagesSettingService.getList({
      body: {},
      meta: {
        offset: currentPage,
        limit: paginationLimit,
        sort: [
          {
            order: "desc",
            field: "createdOn",
          },
        ],
      },
    })
      .then((res) => {
        setPages(res.body);
        setPageMeta(res.meta || {});
        setIsLoading(false);
        dispatch(setGlobCustomerList(res.body));
      })
      .catch((err) => {
        ToastService.error(err.message);
        setIsLoading(false);
      });
  };

  const onDelete = (page: IPagesSettings) => {
    if (!page) return;
    deleteItem.current = page;
    setConfirmationModal(true);
  };

  const onCloseConfirm = () => {
    setConfirmationModal(false);
    deleteItem.current = null;
  };

  const onConfirmDelete = () => {
    setIsSubmitting(true);
    if (!deleteItem.current?.id) return;
    PagesSettingService.deleteAll({ ids: [deleteItem.current?.id] })
      .then((res) => {
        ToastService.success(res.message);
        getPageList();
        onCloseConfirm();
      })
      .catch((err) => {
        ToastService.error(err.message);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
		<MainFull>
			<FormHeader
				title="Pages"
				rightContent={
					<Button variant="fill" onClick={() => navigate(PAGES_CREATE)}>
						Add Page
					</Button>
				}
			/>
			{isLoading ? <Preloader absolutePosition /> : null}
			<div className="card">
				{!isLoading && pages.length === 0 ? (
					<WxNotFound
						title="No pages found!"
						btn_link={PAGES_CREATE}
						btn_text="Add Page"
					/>
				) : null}

				{pages.length ? (
					<>
						<PageTable pages={pages} onDelete={onDelete} />
						<div className="p-4">
							<Pagination
								meta={pageMeta}
							/>
						</div>
					</>
				) : null}
			</div>
			<ConfirmationModal
				isOpen={confirmationModal}
				onClose={onCloseConfirm}
				onConfirm={onConfirmDelete}
				isSubmitting={isSubmitting}
				title="Page Delete Confirmation!"
				body={
					<p>
						Do you want to delete this page <b>{deleteItem.current?.title}</b>?
						This action will delete permanently.
					</p>
				}
			/>
		</MainFull>
	);
};
export default Pages;
