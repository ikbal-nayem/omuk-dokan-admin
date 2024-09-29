import "./WxTextarea.scss";

type Colors = "primary" | "secondary" | "danger" | "warning" | "success";
// type W = 25 | 50 | 75 | 100;

interface ITextareaProps {
	color?: Colors;
	className?: string;
	style?: object;
	isRequired?: boolean;
	placeholder?: string;
	type?: string;
	helpText?: JSX.Element | string;
	label?: string | JSX.Element;
	labelRight?: JSX.Element | string;
	registerProperty?: any;
	isAutoFocus?: boolean;
	onChange?: Function;
	noMargin?: boolean;
	rows?: number;
	maxLength?: number;
	errorMessage?: string;
}

const WxTextarea = ({
	color = "secondary",
	isRequired = false,
	label,
	placeholder,
	type,
	labelRight,
	helpText,
	registerProperty,
	isAutoFocus = false,
	onChange,
	noMargin,
	rows,
	maxLength,
	errorMessage,
}: ITextareaProps) => {
	return (
		<div className={`wx__form_group ${noMargin ? "wx__m-0" : ""}`}>
			{label ? (
				typeof label === "string" ? (
					<label htmlFor="">
						{label} {isRequired && <span>*</span>}
					</label>
				) : (
					<>{label}</>
				)
			) : null}
			{labelRight && <div className="wx__float-end">{labelRight}</div>}
			<textarea
				className={`wx__m-0 wx__input_${color}`}
				type={type}
				required={isRequired}
				autoFocus={isAutoFocus}
				onChange={onChange}
				placeholder={placeholder}
				maxLength={maxLength}
				rows={rows}
				spellCheck
				{...registerProperty}
			/>
			{errorMessage ? (
				typeof errorMessage === "string" ? (
					<span className={`note_text wx__text-danger`}>{errorMessage}</span>
				) : (
					<>{errorMessage}</>
				)
			) : null}
			{helpText ? (
				typeof helpText === "string" ? (
					<span
						className={`note_text ${
							color === "danger" ? "wx__text-danger" : ""
						}`}
					>
						{helpText}
					</span>
				) : (
					<>{helpText}</>
				)
			) : null}
		</div>
	);
};

export default WxTextarea;
