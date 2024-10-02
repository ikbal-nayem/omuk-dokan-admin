import WxButton from '@components/Button';
import WxIcon from '@components/Icon';
import { FC } from 'react';

const SomethingWrong: FC = () => {
	return (
		<div className='w-100'>
			<div className='card text-center p-5 d-flex align-items-center justify-content-center'>
				<h2 className='text_regular text_h2 mb-4'>Oops!</h2>
				<img src='/media/svg/something-wrong.svg' alt='Something went wrong' height={250} />
				<p className='text_body text_regular my-4'>Something went wrong!</p>
				<WxButton variant='fill'>
					<WxIcon icon='refresh' onClick={() => window.location.reload()} />
					&nbsp; Reload
				</WxButton>
			</div>
		</div>
	);
};

export default SomethingWrong;
