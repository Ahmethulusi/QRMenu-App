import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import '../css/profileDropdown.css'; // CSS dosyasını ekliyoruz

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Dropdown'u referans olarak takip etmek için kullanıyoruz.

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Menü dışında tıklama olayını algılamak için bir useEffect kullanıyoruz.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Eğer tıklanan element dropdown değilse menüyü kapat
      }
    };

    // Olay dinleyicisini window üzerine ekle
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup işlemi: Olay dinleyicisini bileşen yok olduğunda kaldır
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    
  <div class="dropdown">
    <FontAwesomeIcon className="dropbtn" icon={faUser} />
    {/* <button class="dropbtn">Profile</button> */}
    <div class="dropdown-content">
      <a href="#">Settings</a>
      <a href="#">Account</a>
      <a href="#">Log Out</a>
    </div>
  </div>



  );
};

export default ProfileDropdown;
