import { gql, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import Navbar from "../component/Navbar";
import Schedule from "../component/Schedule";
import { useGroupsStore } from "../store/groups";
import JWT from 'jwt-client'
import { useUserStore } from '../store/user'


export default function MainPage() {
  const setGtoups = useGroupsStore(state => state.setGroups)

  useQuery(gql`query Groups {
    groups {
      all {
        id
        name
        schedule {
          id
          static
          name
          start
          end
          events {
            startDayHour
            endDayHour
            inner {

            ...EventFragment
            }
          }
        }
      }
    }
  }
  
  fragment EventFragment on EventType {
    Id: id
    title: name
    startDate: start
    endDate: end
  }`, {
    onCompleted: (data) => {
      console.log(data.groups.all)
      setGtoups(data.groups.all)
    }
  }
  )

  const setUser = useUserStore((state) => state.setUser)


  useEffect(() => {
    const token = localStorage.getItem("token")
    try {
      var session = JWT.read(token)
      console.log(session)
      setUser(session.claim)
    } catch { }
  }, [setUser])


  return (
    <>
      <Navbar />
      <Schedule />
    </>
  );
}
