import React, { useEffect, useState } from "react";
import {Button} from "@components/Button";
import WxModal from "@components/Modal";
import WxModalBody from "@components/Modal/ModalBody";
import WxModalFooter from "@components/Modal/ModalFooter";
import WxModalHeader from "@components/Modal/ModalHeader";
import TextInput from "@components/TextInput";
import { OrderService } from "services/api/Order.service";
import { ToastService } from "services/utils/toastr.service";

interface EditNotesProps {
	orderId: string;
	defaultNote?: string;
	onOrderNoteUpdate?: any;
}

export const EditNotes = ({
	orderId,
	defaultNote,
	onOrderNoteUpdate,
}: EditNotesProps) => {
	const [open, setOpen] = React.useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
	const [note, setNote] = useState<string>(defaultNote || "");
	const [error, setError] = useState<boolean>(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!note) {
			setError(true);
			return;
		}
		setIsSubmitting(true);
		OrderService.updateOrderNote(orderId, { orderNote: note })
			.then((resp) => {
				setOpen(false);
				onOrderNoteUpdate(resp.body?.orderNote);
			})
			.catch((err) => ToastService.error(err.message))
			.finally(() => setIsSubmitting(false));
		setError(false);
	};

	return (
		<>
			<span
				className="text-primary text_small"
				role="button"
				onClick={() => setOpen(true)}
			>
				Edit
			</span>
			<WxModal show={open}>
				<WxModalHeader
					title="Edit Notes"
					onClickClose={() => setOpen(false)}
				/>
				<form onSubmit={handleSubmit} noValidate>
					<WxModalBody>
						<TextInput
							isRequired
							label="Order Notes"
							isAutoFocus
							value={note}
							onChange={(e) => setNote(e.target.value)}
							color={error ? "danger" : "secondary"}
							errorMessage={error ? "Please enter a note" : ""}
						/>
					</WxModalBody>
					<WxModalFooter>
						<div className="d-flex justify-content-end">
							<Button
								className="me-3"
								variant="outline"
								color="secondary"
								onClick={() => setOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button variant="fill" type="submit" disabled={isSubmitting}>
								Done
							</Button>
						</div>
					</WxModalFooter>
				</form>
			</WxModal>
		</>
	);
};
