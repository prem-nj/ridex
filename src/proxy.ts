import { useSession } from "next-auth/react"
import { NextURL } from "next/dist/server/web/next-url"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

const PUBLIC_ROUTES = ["/"]

export const proxy=async(req:NextRequest)=>{
const {pathname}=await req.nextUrl
const session=await auth()
const role=session?.user?.role


if(   
pathname.startsWith("/next")|| pathname.startsWith("/favicon.icon")||
  /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)

){
    return NextResponse.next()

}


if(PUBLIC_ROUTES.includes('/api/auth')){
    return NextResponse.next()
}

if(PUBLIC_ROUTES.includes(pathname)){
    return NextResponse.next()
}

if(pathname.startsWith("/admin")){
    if(role!="admin"){
        return NextResponse.redirect(new URL("/", req.url))
    }
}

if(pathname.startsWith("/partner")){
     if(pathname.startsWith("/partner/onboarding")){
              return NextResponse.next()
         }
         
    if(role!="partner"){
        return NextResponse.redirect(new URL("/",req.url))
    }
}
if(pathname.startsWith("/api")){
    if(!session?.user){
        return NextResponse.json({
            message:"unauthrize",
            status:401
        })
    }
}

return NextResponse.next()

}


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};