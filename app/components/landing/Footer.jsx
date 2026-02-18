import Image from 'next/image';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { FiPhone } from 'react-icons/fi'; // Import phone icon

const Footer = () => {
  const tFooter = useTranslations('homePage.footer');

  // Contact Number
  const contactNumber = "09611-901131";
  
  // Company Description
  const companyDescription = "Passed to ensure these COD constraints & a reduction assessment will apply every million customers. Have any option?";

  const footerLinks = [
    {
      title: tFooter('titleOne'),
      links: [
        { name: tFooter('links.0'), url: '#' },
        { name: tFooter('links.1'), url: '#' },
        { name: tFooter('links.2'), url: '#' },
      ],
    },
    {
      title: tFooter('titleTwo'),
      links: [
        { name: tFooter('links.3'), url: '#' },
        { name: tFooter('links.4'), url: '#' },
        { name: tFooter('links.5'), url: '#' },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <FaTwitter size={16} />,
      bgColor: 'bg-[#33CCFF]',
      url: '#',
    },
    {
      icon: <FaInstagram size={16} />,
      bgColor: 'bg-gradient-to-r from-[#FEE411] via-[#FE2181] to-[#9000DC]',
      url: '#',
    },
    {
      icon: <FaFacebook size={16} />,
      bgColor: 'bg-[#337FFF]',
      url: 'https://www.facebook.com/share/1CDkvRcP84/', // Facebook link added
    },
    {
      icon: <FaYoutube size={16} />,
      bgColor: 'bg-[#FF0000]',
      url: '#',
    },
  ];

  return (
    <footer className="w-full mt-16 scroll-mt-24" id="about">
      <div className="mx-auto container px-4 scroll-mt-24" id="contact">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 gap-y-8 md:gap-8 py-10 max-w-sm mx-auto sm:max-w-3xl lg:max-w-full">
          
          {/* Company Info Section - Logo, Contact, Description */}
          <div className="col-span-full mb-6 lg:col-span-2 lg:mb-0">
            {/* Logo */}
            <div className="mb-4">
              <Image
                className="cursor-pointer w-28 md:w-52"
                src="/img/logo.png"
                width={200}
                height={100}
                alt="Foorti Courier Logo"
                priority
              />
            </div>

            {/* Contact Information  */}
            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100 w-fit">
                {/* Phone Icon  */}
                <FiPhone className="h-5 w-5 text-[#1976d2]" />
                <span className="text-primary font-semibold text-base">Contact Us</span>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${contactNumber.replace('-', '')}`} 
                    className="text-secondary text-[18px] font-bold hover:text-[#1976d2] transition-colors"
                  >
                    {contactNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Company Description - As per image */}
            <div className="mt-2 max-w-md">
              <p className="text-gray-600 text-[15px] leading-relaxed">
                {companyDescription}
              </p>
            </div>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index} className="lg:mx-auto text-left">
              <h4 className="text-primary font-[600] text-[1.3rem] mb-4">
                {section.title}
              </h4>
              <ul className="text-sm transition-all duration-500">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="mb-6">
                    <a 
                      href={link.url} 
                      className="text-secondary text-[16px] hover:text-[#1976d2] transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:mx-auto text-left">
            <h4 className="text-primary font-[600] text-[1.3rem] mb-4">
              {tFooter('social')}
            </h4>

            <div className="flex mt-4 space-x-4 lg:mt-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative w-8 h-8 rounded-full transition-all duration-500 flex justify-center items-center ${social.bgColor} hover:scale-110 hover:shadow-lg text-white`}
                  aria-label={`Follow us on ${social.icon.type.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-col items-center flex-wrap gap-5 justify-center">
              <button className="px-6 cursor-pointer bg-black rounded-md flex items-center gap-[17px] hover:bg-gray-800 transition-colors">
                <Image
                  src="/img/app (1).png"
                  alt="apple logo"
                  className="w-[30px]"
                  width={500}
                  height={500}
                />
                <div>
                  <span className="text-[0.6rem] font-[500] text-[#fff]">
                    Download on the
                  </span>
                  <h3 className="text-[0.9rem] font-[500] leading-[20px] mb-2 text-[#fff]">
                    AppStore
                  </h3>
                </div>
              </button>

              <button className="px-6 cursor-pointer border border-[#424242] rounded-md flex items-center gap-[17px] hover:bg-gray-50 transition-colors">
                <Image
                  src="/img/app (2).png"
                  alt="google play logo"
                  className="w-[30px]"
                  width={500}
                  height={500}
                />
                <div>
                  <span className="text-[#424242] text-[0.6rem] font-[500]">
                    Download on the
                  </span>
                  <h3 className="text-[0.9rem] font-[500] leading-[20px] mb-2">
                    PlayStore
                  </h3>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="py-7 border-t border-gray">
          <div className="flex items-center justify-center">
            <span className="text-md text-secondary">
              <a target="_blank" href="https://creativesoftware.com.bd/" rel="noopener noreferrer">
                {tFooter('copyRight')}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;