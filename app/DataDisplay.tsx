'use client';

import { useState, useEffect } from 'react';

const DataDisplay = () => {
  const [solarAltitude, setSolarAltitude] = useState(0);
  const [solarAzimuth, setSolarAzimuth] = useState(0);
  const [siderealTime, setSiderealTime] = useState('00:00:00');
  const [airMass, setAirMass] = useState(1);

  const latitude = '-12.05165965';
  const longitude = '-77.03460483';

  const altitude = '120.3 m';

  const sunrise = '06:29:14';
  const solarNoon = '12:10:26';
  const sunset = '17:51:37';

  const solarDeclination = '+23.44°';
  const dayLength = '11.37 h';

  const pressure = '1014 hPa';
  const humidity = '78.2 %';
  const uvIndex = '4.1';

  const detector = 'MUC v4.05 IV';

  useEffect(() => {
    const updateData = () => {
      const now = new Date();

      const hours =
        now.getHours() +
        now.getMinutes() / 60 +
        now.getSeconds() / 3600;

      const altitude =
        Math.sin(((hours - 6) / 12) * Math.PI) * 90;

      const azimuth =
        (((hours - 6 + 24) % 24) / 24) * 360;

      setSolarAltitude(altitude);
      setSolarAzimuth(azimuth);

      const zenith = 90 - Math.max(0.1, altitude);

      const am =
        1 /
        Math.max(
          0.1,
          Math.cos((zenith * Math.PI) / 180)
        );

      setAirMass(am);

      const siderealHours =
        hours * 1.002737909;

      const h =
        Math.floor(siderealHours) % 24;

      const m = Math.floor(
        (siderealHours % 1) * 60
      );

      const s = Math.floor(
        ((((siderealHours % 1) * 60) % 1) * 60)
      );

      setSiderealTime(
        `${String(h).padStart(2, '0')}:${String(
          m
        ).padStart(2, '0')}:${String(s).padStart(
          2,
          '0'
        )}`
      );
    };

    updateData();

    const interval = setInterval(updateData, 1000);

    return () => clearInterval(interval);
  }, []);

  const equationStyle = {
    textAlign: 'center' as const,
    margin: '1rem 0',
    lineHeight: 1.8,
  };

  return (
    <article
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '4rem 2rem',
        fontFamily: 'var(--font-cm)',
        lineHeight: 1.8,
        textAlign: 'justify',
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '4rem',
        }}
      >
        <h1
          style={{
            fontWeight: 400,
            marginBottom: '0.5rem',
          }}
        >
          Observational Dataset
        </h1>

        <p
          style={{
            fontStyle: 'italic',
            opacity: 0.75,
          }}
        >
          Solar, atmospheric and optical parameters
          associated with a pinhole observation
          conducted in Lima, Peru.
        </p>
      </header>

      <section>
        <p>
          The present record corresponds to an
          observation site located at latitude{' '}
          <i>φ</i> = {latitude}° and longitude{' '}
          <i>λ</i> = {longitude}°, at an elevation of{' '}
          <i>h</i> = {altitude} above mean sea level.
          The site lies on the central Peruvian coast,
          within the South Pacific atmospheric system,
          a region characterized by persistent marine
          humidity and seasonal cloud cover.
        </p>

        <p>
          Local solar conditions indicate sunrise at{' '}
          {sunrise}, solar culmination at{' '}
          {solarNoon}, and sunset at {sunset}. The
          resulting daylight interval is approximately{' '}
          {dayLength}. At the current epoch, the solar
          declination is {solarDeclination},
          corresponding to the northern summer
          solstice.
        </p>

        <p>
          The apparent position of the Sun above the
          horizon is measured as a solar altitude of{' '}
          {solarAltitude.toFixed(2)}° and a solar
          azimuth of {solarAzimuth.toFixed(2)}°. These
          values determine the direction and length of
          projected shadows and strongly influence the
          exposure characteristics of pinhole imaging
          systems.
        </p>

        <p>
          Atmospheric measurements indicate a surface
          pressure of {pressure}, a relative humidity
          of {humidity}, and an ultraviolet index of{' '}
          {uvIndex}. The corresponding optical air
          mass is estimated as {airMass.toFixed(2)},
          representing the relative thickness of the
          atmosphere traversed by incoming solar
          radiation.
        </p>

        <p>
          Local sidereal time is presently{' '}
          {siderealTime}. Unlike solar time, sidereal
          time is referenced to the apparent motion of
          distant stars and is commonly employed in
          astronomy for determining celestial
          coordinates.
        </p>
      </section>

      <section
        style={{
          marginTop: '3rem',
        }}
      >
        <h2
          style={{
            fontWeight: 400,
            marginBottom: '1rem',
          }}
        >
          Optical Relations
        </h2>

        <p>
          The geometric and optical behavior of a
          pinhole camera may be approximated through
          the following relations.
        </p>

        <div style={equationStyle}>
          <div>
            <i>N</i> = <i>f</i> / <i>D</i>
          </div>

          <div>
            <i>D</i> = 1.9√(<i>fλ</i>)
          </div>

          <div>
            <i>AM</i> = sec(<i>z</i>)
          </div>

          <div>
            <i>h</i> = 90° − |<i>φ</i> − <i>δ</i>|
          </div>

          <div>
            <i>I</i> = <i>I₀</i> cos(<i>z</i>)
          </div>

          <div>
            tan(<i>θ</i>) = <i>h</i> / <i>s</i>
          </div>
        </div>

        <p>
          Here, <i>f</i> denotes focal length,{' '}
          <i>D</i> the pinhole diameter,{' '}
          <i>λ</i> the wavelength of visible light,{' '}
          <i>z</i> the solar zenith angle,{' '}
          <i>δ</i> the solar declination,{' '}
          <i>θ</i> the solar altitude, and{' '}
          <i>s</i> the projected shadow length. These
          relations connect terrestrial geometry,
          atmospheric optics, and photographic
          exposure.
        </p>
      </section>

      <section
        style={{
          marginTop: '3rem',
        }}
      >
        <h2
          style={{
            fontWeight: 400,
            marginBottom: '1rem',
          }}
        >
          Instrument Record
        </h2>

        <p>
          Data acquisition was performed using
          detector <i>{detector}</i>. Temporal values
          are continuously updated according to the
          system clock. Atmospheric and astronomical
          quantities are presented as observational
          metadata accompanying the image sequence.
        </p>
      </section>

      <footer
        style={{
          marginTop: '5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(0,0,0,0.15)',
          fontStyle: 'italic',
          textAlign: 'center',
          opacity: 0.75,
        }}
      >
        Observatory Record · Lima, Peru · Earth Epoch
        2026
      </footer>
    </article>
  );
};

export default DataDisplay;