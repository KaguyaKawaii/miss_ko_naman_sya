import Picture from '../assets/picture.jpg';

function Body() {
  return (
    <main className="h-screen bg-no-repeat bg-cover bg-center flex items-center justify-start opacity-100" style={{ backgroundImage: `url(${Picture})` }}>

      <div className='pl-[200px] flex flex-col items-start justify-start'>
        <h1 className='text-7xl text-white font-semibold font-serif'><span className='text-[#FFCC00]'>USA-FLD</span> Circulink</h1>

        <p className='text-4xl text-white font-normal'>A Web-based library room reservation system</p>
      </div>

    </main>

    
  );
}

export default Body;
