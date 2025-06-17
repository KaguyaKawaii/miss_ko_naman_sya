import Logo from '../assets/logo.png';

function Header({ onLoginClick }) {
  return (
    <header className='absolute top-0 left-0 w-full z-50 flex'>
      <nav className='w-full flex items-center justify-between bg-[#CC0000] p-5 shadow-lg'>
        <div className='flex items-center'>
          <img className='w-[60px] h-[60px] mr-5' src={Logo} alt="Logo" />
          <h1 className='text-3xl font-serif font-normal text-white'>
            University of San Agustin
          </h1>
        </div>

        <div className='mr-5 cursor-pointer' onClick={onLoginClick}>
          <h2 className='text-2xl font-medium text-white hover:text-gray-300 hover:duration-100'>Login</h2>
        </div>
      </nav>
    </header>
  );
}

export default Header;

