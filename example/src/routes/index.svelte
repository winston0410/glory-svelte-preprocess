<script>
  console.log('check hello world')
</script>

<style>
    h1{
        font-size: 40px;
    }
    .hello{
        color: red;
        font-size: 12px;
    }

    @media (min-width: 30em) and (max-width: 80em)  {
        .hello{
           font-size: 100px;
        }
    }

    .world{
        color: red;
        font-size: 16px;
    }
</style>

<h1 id="me" class="hello">This preprocess</h1>
<h2 class="world">
    <p>does magic!</p>
</h2>
