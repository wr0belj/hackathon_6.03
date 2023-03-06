import { useEffect, useState } from "react";

import GooglePlacesAutocomplete from 'r omplete';

import './override.css'

function SearchComp(props) {
  return (
    <GooglePlacesAutocomplete apiKey="xxx" />  
  );
}

export default SearchComp;
