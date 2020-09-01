import Layout from '@components/Layout'
import PostList from '@components/PostList'

import getPosts from '@utils/getPosts'

const Index = ({ posts, title, description, ...props }) => {
  return (
    <>
      <Layout pageTitle={title} description={description}>
        <h1 className="title">Welcome to this demo blog!</h1>

        <p className="description">
          This is an awesome built with Next
        </p>
/////////////////////////
<h1 style="text-align:center;">The 7 Continents</h1>

<h4 style="text-align:center;">&#10148; Click on the dots in the image to go to a continent section</h4>

<map name="continents_map">

 <area shape="circle" coords="70,70,10" href="#north_america">

 <area shape="circle" coords="133,185,10" href="#south_america">

 <area shape="circle" coords="270,137,10" href="#africa">

 <area shape="circle" coords="292,44,10" href="#europe">

 <area shape="circle" coords="469,201,10" href="#australia">

 <area shape="circle" coords="374,65,10" href="#asia">

 <area shape="circle" coords="340,267,10" href="#antartica">

</map>

<figure style="text-align:center;">

    <img usemap="#continents_map" src=https://bit.ly/2bgFrvL width="600px" />

    <figcaption>World Map</figcaption>

</figure>

<div>

    <h3 id="africa">Africa</h3>

    <p>Our locations in Africa</p>

</div>

<div>

    <h3 id="asia">Asia</h3>

    <p>Our locations in Asia</p>

</div>

<div>

    <h3 id="europe">Europe</h3>

    <p>Our locations in Europe.</p>

</div>

<div>

    <h3 id="south_america">South America</h3>

    <p>Our locations in South America.</p>

</div>

<div>

    <h3 id="north_america">North America</h3>

    <p>Our locations in North America:</p>

</div>

<div>

    <h3 id="antartica">Antarctica</h3>

    <p>Our locations in Antarctica.</p>

</div>

<div>

    <h3 id="australia">Australia</h3>

    <p>Our locations in Australia.</p>

</div>
//////////
        <main>
          <PostList posts={posts} />
        </main>
        
      </Layout>
      <style jsx>{`
        .title {
          margin: 1rem auto;
          font-size: 3rem;
        }
///////////////
	body {
    font-family: "bookman old style";
}
:target {
    color: lightyellow;
    background: indianred;
}
h3,
h1 {
    color: indianred;
}
img {
    border: 3px dashed indianred;
}
body {
    counter-reset: srl;
}
h3::before {
    counter-increment: srl;
    content: counter(srl)". ";
}
//////////
      `}</style>
    </>
  )
}

export default Index

export async function getStaticProps() {
  const configData = await import(`../siteconfig.json`)

  const posts = ((context) => {
    return getPosts(context)
  })(require.context('../posts', true, /\.md$/))

  return {
    props: {
      posts,
      title: configData.default.title,
      description: configData.default.description,
    },
  }
}
