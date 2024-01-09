'use client';

import dynamic from 'next/dynamic';
import useCountries from '@/app/hooks/useCountries';
import { IconType } from 'react-icons';
import Avatar from '../Avatar';
import { SafeUser } from '@/app/types';
import ListingCategory from './ListingCategory';
import Button from '../Button';
import { Feature } from '@prisma/client';

const Map = dynamic(() => import('../Map'), { ssr: false });

interface ListingInfoProps {
  user: SafeUser;
  features: Feature[];
  description: string;

  category:
  | {
    icon: IconType;
    label: string;
    description: string;
  }
  | undefined;
  locationValue: string;
  addFeature: (featureIndex: number) => void;
  featureVisibility: boolean[];
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  category,
  locationValue,
  features,
  // featureOne,
  // featureTwo,
  addFeature,
  featureVisibility,
 
}) => {
  const { getByValue } = useCountries();
  const featureToAdd = 'Wi-Fi';

  const coordinates = getByValue(locationValue)?.latlng;
  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div
          className="
        text-xl 
        font-semibold 
        flex 
        flex-row 
        items-center
        gap-2
      "
        >
          <div>Owner {user?.name}</div>
          <Avatar src={user?.image} />
        </div>
        <div
          className="
          
            font-light
            text-neutral-500
          "
        >
          <div className="grid grid-cols-3  font-semibold text-black">
         <text>
              Service
            </text>
           <div className="ml-5">
             Price
             </div>
           <div className="">

           </div>
          </div>
          {
            features.map((feature, index) => (
              // eslint-disable-next-line react/jsx-key
              featureVisibility[index] &&(
              // eslint-disable-next-line react/jsx-key
              <div className="grid grid-cols-3  py-2">
               <div className="">
                {feature.service}
                </div>
                
                {` $ ${feature.price} `}
                
                <Button label="Add" onClick={() => addFeature(index)} />
              </div>
              )
            ))
          }

        </div>
      </div>

      <hr />
      {category && (
        <ListingCategory
          icon={category.icon}
          label={category?.label}
          description={category?.description}
        />
      )}
      {/* <hr />
      <Map center={coordinates} /> */}
    </div>
  );
};

export default ListingInfo;
